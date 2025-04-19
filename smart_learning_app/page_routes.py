import frappe

def get_context(context):
    """Get context for web pages"""
    context.no_cache = 1
    return context

def get_login_context(context):
    """Get context for login page"""
    context.no_cache = 1
    return context

def get_signup_context(context):
    """Get context for signup page"""
    context.no_cache = 1
    return context

def get_course_context(context):
    """Get context for course page"""
    context.no_cache = 1
    return context

def get_lecture_context(context):
    """Get context for lecture page"""
    context.no_cache = 1
    return context 