import frappe

def get_context(context):
    """Get context for lecture page"""
    context.no_cache = 1
    
    # Lấy thông tin bài giảng từ route
    lecture_name = frappe.form_dict.lecture
    lecture = frappe.get_doc("Lecture", lecture_name)
    
    # Thêm thông tin bài giảng vào context
    context.lecture = lecture
    
    # Lấy thông tin khóa học của bài giảng
    context.course = frappe.get_doc("Course", lecture.course)
    
    # Lấy danh sách bài giảng của khóa học để hiển thị sidebar
    context.course_lectures = frappe.get_all(
        "Lecture",
        fields=["name", "title", "duration"],
        filters={"course": lecture.course},
        order_by="creation"
    )
    
    return context 