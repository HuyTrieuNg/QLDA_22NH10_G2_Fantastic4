import frappe
from frappe import _

@frappe.whitelist(allow_guest=True)
def get_featured_courses():
    """Get list of featured courses"""
    courses = frappe.get_all(
        "Course",
        fields=["name", "title", "description", "image", "instructor as teacher_name", "price", "duration"],
        filters={"published": 1},
        order_by="creation desc",
        limit=6
    )
    
    # Get instructor names
    for course in courses:
        if course.teacher_name:
            user = frappe.get_doc("User", course.teacher_name)
            course.teacher_name = user.full_name
            
    return courses

@frappe.whitelist(allow_guest=True)
def get_recent_courses():
    """Get list of recent courses"""
    courses = frappe.get_all(
        "Course",
        fields=["name", "title", "description", "image", "instructor as teacher_name", "price", "duration"],
        filters={"published": 1},
        order_by="creation desc",
        limit=6
    )
    
    # Get instructor names
    for course in courses:
        if course.teacher_name:
            user = frappe.get_doc("User", course.teacher_name)
            course.teacher_name = user.full_name
            
    return courses

@frappe.whitelist()
def get_course_details(course_name):
    """Get detailed information about a course"""
    if not course_name:
        frappe.throw(_("Course name is required"))
        
    course = frappe.get_doc("Course", course_name)
    
    # Check if user has access
    if not course.published and not frappe.has_permission("Course", "read", course):
        frappe.throw(_("You don't have permission to access this course"))
        
    # Get instructor details
    instructor = frappe.get_doc("User", course.instructor)
    
    # Get lectures
    lectures = frappe.get_all(
        "Lecture",
        fields=["name", "title", "description", "duration", "video_url"],
        filters={"course": course_name},
        order_by="creation"
    )
    
    # Get total enrolled students
    enrolled_students = frappe.db.count("Course Student", {"course": course_name})
    
    return {
        "course": course,
        "instructor": {
            "name": instructor.name,
            "full_name": instructor.full_name,
            "bio": instructor.bio if hasattr(instructor, 'bio') else ""
        },
        "lectures": lectures,
        "enrolled_students": enrolled_students
    }

@frappe.whitelist()
def enroll_course(course_name):
    """Enroll current user in a course"""
    if not frappe.session.user or frappe.session.user == "Guest":
        frappe.throw(_("Please login to enroll in the course"))
        
    if not course_name:
        frappe.throw(_("Course name is required"))
        
    # Check if course exists and is published
    course = frappe.get_doc("Course", course_name)
    if not course.published:
        frappe.throw(_("This course is not available for enrollment"))
        
    # Check if already enrolled
    if frappe.db.exists("Course Student", {"course": course_name, "student": frappe.session.user}):
        frappe.throw(_("You are already enrolled in this course"))
        
    # Create enrollment
    enrollment = frappe.get_doc({
        "doctype": "Course Student",
        "course": course_name,
        "student": frappe.session.user
    })
    enrollment.insert(ignore_permissions=True)
    
    return {"message": "Successfully enrolled in the course"} 