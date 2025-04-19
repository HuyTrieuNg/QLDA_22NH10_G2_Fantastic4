import frappe

def get_context(context):
    """Get context for home page"""
    context.no_cache = 1
    return context 