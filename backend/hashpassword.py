from flask_bcrypt import Bcrypt
bcrypt = Bcrypt()
hashed_password = bcrypt.generate_password_hash('Evaluator#1').decode('utf-8')
print(hashed_password)