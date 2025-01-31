from flask import Flask
from datetime import timedelta
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS

# Import models & blueprints
from models import db, TokenBlocklist
from views.auth import auth_bp
from views.user import user_bp
from views.budget import budget_bp
from views.expense import expense_bp

# Initialize Flask-Mail (before app is created)
mail = Mail()

def create_app():

    app = Flask(__name__)  # Define app inside the function
    CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})  # Enable CORS for all routes

    # Database configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///budget.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # JWT configuration
    app.config["JWT_SECRET_KEY"] = "yes12"
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

    # Flask-Mail configuration
    app.config['MAIL_SERVER'] = 'smtp.example.com'  # Replace with actual mail server
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USE_SSL'] = False
    app.config['MAIL_USERNAME'] = 'faith.nguli@student.moringaschool.com'  # Your email
    app.config['MAIL_PASSWORD'] = 'jcoq fzsb ypjt jrae'  # Your email password
    app.config['MAIL_DEFAULT_SENDER'] = 'faith.nguli@student.moringaschool.com'

    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)  # Flask-Migrate setup
    jwt = JWTManager(app)
    mail.init_app(app)  # Initialize mail

    # Token blocklist check
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(_jwt_header, jwt_payload: dict) -> bool:
        jti = jwt_payload.get("jti")
        return db.session.query(TokenBlocklist.id).filter_by(jti=jti).scalar() is not None
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(budget_bp)
    app.register_blueprint(expense_bp)

    return app  # Ensure function returns app


# Ensure script runs Flask correctly
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
