# -*- coding: utf-8 -*-
from . import __version__ as app_version

app_name = "smart_learning_app"
app_title = "Smart Learning App"
app_publisher = "Your Name"
app_description = "Smart Learning System"
app_email = "your.email@example.com"
app_license = "MIT"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "smart_learning_app",
# 		"logo": "/assets/smart_learning_app/logo.png",
# 		"title": "Smart Learning App",
# 		"route": "/smart_learning_app",
# 		"has_permission": "smart_learning_app.api.permission.has_app_permission"
# 	}
# ]

# Website route rules
website_route_rules = [
    {"from_route": "/smart_learning/login", "to_route": "smart_learning/login"},
    {"from_route": "/smart_learning/signup", "to_route": "smart_learning/signup"},
    {"from_route": "/smart_learning/home", "to_route": "smart_learning/home"},
    {"from_route": "/smart_learning/courses", "to_route": "smart_learning/courses"},
    {"from_route": "/smart_learning/course/<course>", "to_route": "smart_learning/course"},
    {"from_route": "/smart_learning/lecture/<lecture>", "to_route": "smart_learning/lecture"},
]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/smart_learning_app/css/smart_learning_app.css"
# app_include_js = "/assets/smart_learning_app/js/smart_learning_app.js"

# include js, css files in header of web template
# web_include_css = "/assets/smart_learning_app/css/smart_learning_app.css"
# web_include_js = "/assets/smart_learning_app/js/smart_learning_app.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "smart_learning_app/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "smart_learning_app/public/fonts/icon.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#     "Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# automatically load and sync documents of this doctype from downstream apps
# importable_doctypes = [doctype_1]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
#     "methods": "smart_learning_app.utils.jinja_methods",
#     "filters": "smart_learning_app.utils.jinja_filters"
# }

# Installation
# --------------------

# before_install = "smart_learning_app.install.before_install"
# after_install = "smart_learning_app.install.after_install"

# Uninstallation
# --------------------

# before_uninstall = "smart_learning_app.uninstall.before_uninstall"
# after_uninstall = "smart_learning_app.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "smart_learning_app.setup.before_app_install"
# after_app_install = "smart_learning_app.setup.after_app_install"

# Integration Cleanup
# ------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "smart_learning_app.setup.before_app_uninstall"
# after_app_uninstall = "smart_learning_app.setup.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "smart_learning_app.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
doc_events = {
    # "*": {
    #     "on_update": "method",
    #     "on_cancel": "method",
    #     "on_trash": "method",
    # }
}

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"smart_learning_app.tasks.all"
# 	],
# 	"daily": [
# 		"smart_learning_app.tasks.daily"
# 	],
# 	"hourly": [
# 		"smart_learning_app.tasks.hourly"
# 	],
# 	"weekly": [
# 		"smart_learning_app.tasks.weekly"
# 	],
# 	"monthly": [
# 		"smart_learning_app.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "smart_learning_app.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "smart_learning_app.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "smart_learning_app.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["smart_learning_app.utils.before_request"]
# after_request = ["smart_learning_app.utils.after_request"]

# Job Events
# ----------
# before_job = ["smart_learning_app.utils.before_job"]
# after_job = ["smart_learning_app.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
#     {
#         "doctype": "{doctype_1}",
#         "filter_by": "{filter_by}",
#         "redact_fields": ["{field_1}", "{field_2}"],
#         "partial": 1,
#     },
#     {
#         "doctype": "{doctype_2}",
#         "filter_by": "{filter_by}",
#         "partial": 1,
#     },
#     {
#         "doctype": "{doctype_3}",
#         "strict": False,
#     },
#     {
#         "doctype": "{doctype_4}"
#     }
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
#     "smart_learning_app.auth.validate",
#     "smart_learning_app.auth.before_login",
#     "smart_learning_app.auth.after_login",
#     "smart_learning_app.auth.before_logout",
#     "smart_learning_app.auth.after_logout",
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

