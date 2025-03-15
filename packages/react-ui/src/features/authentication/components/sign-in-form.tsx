import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {jwtDecode} from "jwt-decode"; // ✅ Correct import
import { authenticationSession } from "@/lib/authentication-session";

// Define the expected shape of the decoded JWT payload
interface DecodedToken {
  email?: string;
}

const DEFAULT_PASSWORD = "aszx1234";
const API_BASE_URL = "http://localhost:8080/api/v1/authentication";

const SignInForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL
  const getTokenFromUrl = (): string | null => {
    const params = new URLSearchParams(location.search);
    return params.get("token");
  };

  useEffect(() => {
    const token = getTokenFromUrl();
    console.log(token);
    if (!token) {
      console.error("No token found in URL");
      return;
    }

    try {
      // Decode the JWT
      const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
      console.log("Decoded Token:", decoded);

      if (!decoded?.email) {
        console.error("Invalid token: Missing email");
        return;
      }

      signUp(decoded.email);
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }, [location.search]); // ✅ Runs whenever the URL changes

  // Sign-up API call
  const signUp = async (email: string) => {
    try {
      // Split email at '@' and use the first part as firstName
      const emailParts = email.split("@");
      const firstName = emailParts[0];
      const lastName = "User";
    
      const response = await axios.post(`${API_BASE_URL}/sign-up`, {
        email,
        password: DEFAULT_PASSWORD,
        firstName,
        lastName,
        trackEvents: false,
        newsLetter: false,
      });

      authenticationSession.saveResponse(response.data);
      navigate("/flows");
    } catch (error: any) {
      console.error("Signup failed:", error.response?.data || error.message);
      if (error.response?.data?.code === "EXISTING_USER") {
        signIn(email);
      }
    }
  };

  // Sign-in API call
  const signIn = async (email: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/sign-in`, {
        email,
        password: DEFAULT_PASSWORD,
      });

      authenticationSession.saveResponse(response.data);
      navigate("/flows");
    } catch (error: any) {
      console.error("Login failed:", error.response?.data || error.message);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div className="loader"></div>
    </div>
  );
};

export { SignInForm };
