import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { googleLoginRequest } from "../../api/auth.api";
import { useAuth } from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../utils/apiError";

interface GoogleSignInButtonProps {
  text: "signin_with" | "signup_with";
  onError: (message: string) => void;
}

export function GoogleSignInButton({ text, onError }: GoogleSignInButtonProps) {
  const navigate = useNavigate();
  const { login } = useAuth();

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            if (!credentialResponse.credential) throw new Error("No credential");
            const { user } = await googleLoginRequest({
              idToken: credentialResponse.credential,
            });
            login(user);
            navigate("/chat");
          } catch (err) {
            onError(getApiErrorMessage(err, "Google sign-in failed"));
          }
        }}
        onError={() => onError("Google sign-in failed")}
        theme="filled_black"
        shape="rectangular"
        width="320"
        text={text}
      />
    </div>
  );
}
