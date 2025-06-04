import api from "../api/axiosConfig";

// Debug service to check user status and permissions
export const debugService = {
  // Check current user profile and permissions
  checkUserStatus: async () => {
    try {
      const response = await api.get('/auth/profile/');
      console.log('User profile:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error.response?.data || error.message);
      throw error;
    }
  },

  // Test teacher dashboard access
  testTeacherDashboard: async () => {
    try {
      const response = await api.get('/dashboard/teacher/');
      console.log('Teacher dashboard access successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Teacher dashboard access failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Test my courses access
  testMyCourses: async () => {
    try {
      const response = await api.get('/courses/my-courses/');
      console.log('My courses access successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('My courses access failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Get detailed error information
  diagnosePermissionIssue: async () => {
    const results = {};
    
    try {
      // Check user profile
      results.profile = await this.checkUserStatus();
    } catch (error) {
      results.profileError = error.response?.data || error.message;
    }

    try {
      // Test teacher dashboard
      results.teacherDashboard = await this.testTeacherDashboard();
    } catch (error) {
      results.teacherDashboardError = error.response?.data || error.message;
    }

    try {
      // Test my courses
      results.myCourses = await this.testMyCourses();
    } catch (error) {
      results.myCoursesError = error.response?.data || error.message;
    }

    console.log('Permission diagnosis results:', results);
    return results;
  }
};

export default debugService;
