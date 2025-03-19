from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import hashlib
import json
import time

app = Flask(__name__)
CORS(app, origins='*')
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this to a secure secret key
jwt = JWTManager(app)

# Blockchain class for maintaining academic records
class Block:
    def __init__(self, index, timestamp, data, previous_hash):
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.previous_hash = previous_hash
        self.nonce = 0
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        hash_string = f"{self.index}{self.timestamp}{json.dumps(self.data)}{self.previous_hash}{self.nonce}"
        return hashlib.sha256(hash_string.encode()).hexdigest()

    def mine_block(self, difficulty):
        while self.hash[:difficulty] != "0" * difficulty:
            self.nonce += 1
            self.hash = self.calculate_hash()

class Blockchain:
    def __init__(self):
        self.chain = [self.create_genesis_block()]
        self.difficulty = 2

    def create_genesis_block(self):
        return Block(0, time.time(), {"message": "Genesis Block"}, "0")

    def get_latest_block(self):
        return self.chain[-1]

    def add_block(self, data):
        previous_block = self.get_latest_block()
        new_block = Block(previous_block.index + 1, time.time(), data, previous_block.hash)
        new_block.mine_block(self.difficulty)
        self.chain.append(new_block)

# Initialize blockchain
blockchain = Blockchain()

# Mock database (replace with actual database in production)
users_db = {
    'students': {},
    'teachers': {}
}

courses_db = {}
attendance_db = {}
marks_db = {}

# Authentication routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    user_type = data.get('user_type')
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if user_type not in ['student', 'teacher']:
        return jsonify({'error': 'Invalid user type'}), 400

    db = users_db['students'] if user_type == 'student' else users_db['teachers']
    
    if email in db:
        return jsonify({'error': 'User already exists'}), 400

    hashed_password = generate_password_hash(password)
    user_data = {
        'name': name,
        'email': email,
        'password': hashed_password,
        'user_type': user_type
    }
    
    db[email] = user_data
    blockchain.add_block({
        'type': 'user_registration',
        'user': email,
        'user_type': user_type,
        'timestamp': time.time()
    })

    return jsonify({'message': 'Registration successful'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('user_type')

    db = users_db['students'] if user_type == 'student' else users_db['teachers']
    user = db.get(email)

    if not user or not check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid credentials'}), 401

    access_token = create_access_token(
        identity={'email': email, 'user_type': user_type},
        expires_delta=timedelta(days=1)
    )
    return jsonify({'token': access_token, 'user_type': user_type}), 200

# Course routes
@app.route('/api/courses', methods=['GET', 'POST'])
@jwt_required()
def handle_courses():
    current_user = get_jwt_identity()
    
    if request.method == 'GET':
        return jsonify({'courses': list(courses_db.values())}), 200
    
    if current_user['user_type'] != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    course_id = data.get('course_id')
    course_name = data.get('course_name')
    
    courses_db[course_id] = {
        'course_id': course_id,
        'course_name': course_name,
        'teacher': current_user['email']
    }
    
    blockchain.add_block({
        'type': 'course_creation',
        'course_id': course_id,
        'teacher': current_user['email'],
        'timestamp': time.time()
    })
    
    return jsonify({'message': 'Course created successfully'}), 201

# Attendance routes
@app.route('/api/attendance', methods=['POST'])
@jwt_required()
def mark_attendance():
    current_user = get_jwt_identity()
    if current_user['user_type'] != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    course_id = data.get('course_id')
    student_email = data.get('student_email')
    date = data.get('date')
    status = data.get('status')

    attendance_key = f"{course_id}_{student_email}_{date}"
    attendance_db[attendance_key] = {
        'course_id': course_id,
        'student_email': student_email,
        'date': date,
        'status': status
    }

    blockchain.add_block({
        'type': 'attendance_record',
        'attendance_key': attendance_key,
        'data': attendance_db[attendance_key],
        'timestamp': time.time()
    })

    return jsonify({'message': 'Attendance marked successfully'}), 201

# Marks routes
@app.route('/api/marks', methods=['POST', 'GET'])
@jwt_required()
def handle_marks():
    current_user = get_jwt_identity()
    
    if request.method == 'GET':
        if current_user['user_type'] == 'student':
            student_marks = {k: v for k, v in marks_db.items() if v['student_email'] == current_user['email']}
            return jsonify({'marks': student_marks}), 200
        return jsonify({'marks': marks_db}), 200

    if current_user['user_type'] != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    course_id = data.get('course_id')
    student_email = data.get('student_email')
    marks = data.get('marks')
    assessment_type = data.get('assessment_type')

    marks_key = f"{course_id}_{student_email}_{assessment_type}"
    marks_db[marks_key] = {
        'course_id': course_id,
        'student_email': student_email,
        'marks': marks,
        'assessment_type': assessment_type
    }

    blockchain.add_block({
        'type': 'marks_record',
        'marks_key': marks_key,
        'data': marks_db[marks_key],
        'timestamp': time.time()
    })

    return jsonify({'message': 'Marks recorded successfully'}), 201

# Course registration routes
@app.route('/api/course-registration', methods=['POST'])
@jwt_required()
def register_course():
    current_user = get_jwt_identity()
    if current_user['user_type'] != 'student':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    course_id = data.get('course_id')

    if course_id not in courses_db:
        return jsonify({'error': 'Course not found'}), 404

    blockchain.add_block({
        'type': 'course_registration',
        'student_email': current_user['email'],
        'course_id': course_id,
        'timestamp': time.time()
    })

    return jsonify({'message': 'Course registration successful'}), 201

if __name__ == '__main__':
    app.run(debug=True, port=8000)
