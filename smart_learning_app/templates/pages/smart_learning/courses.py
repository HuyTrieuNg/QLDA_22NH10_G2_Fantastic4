import frappe

def get_context(context):
    """Get context for courses page"""
    context.no_cache = 1
    
    # Get all published courses
    context.courses = frappe.get_all(
        "Course",
        fields=["name", "title", "description", "image", "instructor", "price", "duration"],
        filters={"published": 1},
        order_by="creation desc"
    )
    
    # Get instructor names
    for course in context.courses:
        if course.instructor:
            user = frappe.get_doc("User", course.instructor)
            course.instructor_name = user.full_name
    
    return context 