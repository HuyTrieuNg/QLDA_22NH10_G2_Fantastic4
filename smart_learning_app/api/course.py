import frappe
from frappe import _
import urllib.parse

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

    # Decode course_name nếu nó là dạng URL-encoded
    course_name = urllib.parse.unquote(course_name)

    # Thử lấy theo name, nếu không được thì thử lấy theo title
    try:
        course = frappe.get_doc("Course", course_name)
    except frappe.DoesNotExistError:
        # Thử tìm theo title (dành cho trường hợp truyền title trên URL)
        course_doc = frappe.get_all(
            "Course",
            filters={"title": course_name},
            fields=["name"]
        )
        if course_doc:
            course = frappe.get_doc("Course", course_doc[0].name)
        else:
            frappe.throw(_("Course not found"))
    
    # Check if user has access
    if not course.published and not frappe.has_permission("Course", "read", course):
        frappe.throw(_("You don't have permission to access this course"))
    
    # Get instructor details
    instructor = frappe.get_doc("User", course.instructor)
    
    # Get lectures
    lectures = frappe.get_all(
        "Lecture",
        fields=["name", "title"],
        filters={"course": course.name},
        order_by="creation"
    )
    
    # Get total enrolled students
    enrolled_students = frappe.db.count("Course Student", {"course": course.name})
    
    return {
        "course": {
            "name": course.name,
            "title": course.title,
            "description": course.description,
            "image": frappe.utils.get_url(course.image) if course.image else "",
            "overview": getattr(course, "overview", ""),
        },
        "instructor": {
            "name": instructor.name,
            "full_name": instructor.full_name,
            "bio": getattr(instructor, "bio", ""),
            "avatar": frappe.utils.get_url(instructor.user_image) if instructor.user_image else ""
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