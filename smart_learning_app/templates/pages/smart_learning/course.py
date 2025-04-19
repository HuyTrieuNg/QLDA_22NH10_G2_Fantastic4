import frappe

def get_context(context):
    """Get context for course page"""
    context.no_cache = 1
    
    # Lấy thông tin khóa học từ route
    course_name = frappe.form_dict.course
    course = frappe.get_doc("Course", course_name)
    
    # Thêm thông tin khóa học vào context
    context.course = course
    
    # Lấy danh sách bài giảng của khóa học
    context.lectures = frappe.get_all(
        "Lecture",
        fields=["name", "title", "description", "duration", "video_url"],
        filters={"course": course_name},
        order_by="creation"
    )
    
    return context 