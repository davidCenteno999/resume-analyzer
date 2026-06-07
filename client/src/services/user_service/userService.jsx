import apiClient from "../../api/apiClient";

// Dummy user service for demonstration
class UserService {
    static async get() {
      return await apiClient.get('/users/me');
    }
  }
  
export default UserService;
  