import frappe
from frappe import _

@frappe.whitelist()
def get_lecture_details(lecture_name):
    """Get detailed information about a lecture"""
    if not lecture_name:
        frappe.throw(_("Lecture name is required"))
        
    lecture = frappe.get_doc("Lecture", lecture_name)
    
    # Check if user has access to the course
    if not frappe.has_permission("Course", "read", lecture.course):
        frappe.throw(_("You don't have permission to access this lecture"))
    
    # Get course details
    course = frappe.get_doc("Course", lecture.course)
    
    # Get all lectures in the course for navigation
    course_lectures = frappe.get_all(
        "Lecture",
        fields=["name", "title", "duration", "video_url"],
        filters={"course": lecture.course},
        order_by="creation"
    )
    
    # Get lecture comments/discussion
    comments = frappe.get_all(
        "Discussion",
        fields=["name", "comment", "user", "creation"],
        filters={"lecture": lecture_name},
        order_by="creation desc"
    )
    
    # Get user names for comments
    for comment in comments:
        user = frappe.get_doc("User", comment.user)
        comment.user_name = user.full_name
    
    return {
        "lecture": lecture,
        "course": course,
        "course_lectures": course_lectures,
        "comments": comments
    }

@frappe.whitelist()
def add_comment(lecture_name, comment):
    """Add a comment to a lecture"""
    if not frappe.session.user or frappe.session.user == "Guest":
        frappe.throw(_("Please login to add comments"))
        
    if not lecture_name or not comment:
        frappe.throw(_("Lecture name and comment are required"))
    
    # Check if user has access to the lecture
    lecture = frappe.get_doc("Lecture", lecture_name)
    if not frappe.has_permission("Course", "read", lecture.course):
        frappe.throw(_("You don't have permission to comment on this lecture"))
    
    # Create comment
    discussion = frappe.get_doc({
        "doctype": "Discussion",
        "lecture": lecture_name,
        "comment": comment,
        "user": frappe.session.user
    })
    discussion.insert(ignore_permissions=True)
    
    # Get user info
    user = frappe.get_doc("User", frappe.session.user)
    
    return {
        "name": discussion.name,
        "comment": discussion.comment,
        "user": discussion.user,
        "user_name": user.full_name,
        "creation": discussion.creation
    }

@frappe.whitelist()
def update_lecture_progress(lecture_name, status="Completed"):
    """Update student's progress for a lecture"""
    if not frappe.session.user or frappe.session.user == "Guest":
        frappe.throw(_("Please login to update progress"))
        
    if not lecture_name:
        frappe.throw(_("Lecture name is required"))
    
    # Get lecture and course
    lecture = frappe.get_doc("Lecture", lecture_name)
    
    # Check if user is enrolled in the course
    if not frappe.db.exists("Course Student", {"course": lecture.course, "student": frappe.session.user}):
        frappe.throw(_("You must be enrolled in the course to update progress"))
    
    # Update or create progress record
    if frappe.db.exists("Lecture Progress", {"lecture": lecture_name, "student": frappe.session.user}):
        progress = frappe.get_doc("Lecture Progress", {
            "lecture": lecture_name,
            "student": frappe.session.user
        })
        progress.status = status
        progress.save(ignore_permissions=True)
    else:
        progress = frappe.get_doc({
            "doctype": "Lecture Progress",
            "lecture": lecture_name,
            "student": frappe.session.user,
            "status": status
        })
        progress.insert(ignore_permissions=True)
    
    return {"message": f"Progress updated to {status}"} 