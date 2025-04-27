import frappe
from frappe import _
from frappe.utils import validate_email_address
from frappe.utils.password import update_password
from frappe.core.doctype.user.user import test_password_strength

@frappe.whitelist(allow_guest=True)
def login(email, password):
    try:
        # Validate login
        login_manager = frappe.auth.LoginManager()
        login_manager.authenticate(user=email, pwd=password)
        login_manager.post_login()
        
        # Get user info
        user = frappe.get_doc('User', frappe.session.user)
        return {
            'user': user.name,
            'full_name': user.full_name,
            'user_type': user.user_type,
            'roles': [role.role for role in user.roles]
        }
    except frappe.AuthenticationError:
        frappe.throw(_("Invalid login credentials"))
    except Exception as e:
        frappe.throw(str(e))

@frappe.whitelist(allow_guest=True)
def signup(fullname, email, password, role="Student"):
    try:
        # Validate email
        if not validate_email_address(email):
            frappe.throw(_("Invalid email address"))
            
        # Check password strength
        test_password_strength(password)
        
        # Check if user already exists
        if frappe.db.exists("User", email):
            frappe.throw(_("Email already registered"))
            
        # Create user
        user = frappe.get_doc({
            "doctype": "User",
            "email": email,
            "first_name": fullname,
            "send_welcome_email": 1,
            "enabled": 1,
            "user_type": "Website User"
        })
        
        # Add role based on user type
        if role.lower() == "teacher":
            user.append("roles", {"role": "Course Creator"})
        else:
            user.append("roles", {"role": "Student"})
            
        user.insert(ignore_permissions=True)
        
        # Set password
        update_password(user=email, pwd=password)
        
        # Create student/teacher profile
        if role.lower() == "student":
            create_student_profile(email, fullname)
        elif role.lower() == "teacher":
            create_teacher_profile(email, fullname)
            
        return {
            "message": "Registration successful! Please check your email to verify your account.",
            "user": user.name
        }
        
    except Exception as e:
        frappe.throw(str(e))

def create_student_profile(email, fullname):
    """Create a student profile for the new user"""
    # Check if student profile already exists
    if frappe.db.exists("Course Student", {"email": email}):
        return

    # Create new student profile
    student = frappe.get_doc({
        "doctype": "Course Student",
        "email": email,
        "fullname": fullname,
        "enabled": 1
    })
    student.insert(ignore_permissions=True)
    frappe.db.commit()

def create_teacher_profile(email, fullname):
    """Create teacher profile for new user"""
    # Teacher is a child table, so we don't need to create it directly
    # It will be created when a teacher is assigned to a course
    pass 