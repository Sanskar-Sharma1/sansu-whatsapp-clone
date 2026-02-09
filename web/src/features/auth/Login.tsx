import { Checkbox } from "@mui/material";
import icon from "../../resources/icons/what.svg";
import qrcode from "../../resources/icons/qrcode.svg";
import { GoogleLogin } from "@react-oauth/google";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
// import { saveLoggedInData } from "../../utils";
import { loginWithGoogle } from "./auth.api";

const Login = () => {
  const navigate = useNavigate();
  const { setUserId } = useContext(AuthContext);

  const handleNext = async (response: any) => {
    if (response.credential) {
      setUserId(response.credential);
      const data = await loginWithGoogle(response.credential);
      setUserId(data.user._id);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center">

      <div className="w-full max-w-5xl flex items-center gap-3 pt-10">
        <img src={icon} className="w-8 h-8" alt="Logo" />
        <h1 className="text-2xl font-semibold text-[#25D366]">WhatsApp</h1>
      </div>

      <div className="w-full max-w-5xl mt-8 space-y-4">

        <div className="bg-white border rounded-2xl p-6 shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">
              Download WhatsApp for Mac
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Make calls and get a faster experience when you download the Mac app.
            </p>
          </div>

          <button className="bg-[#111b21] text-white px-6 py-2 rounded-full text-sm">
            Download
          </button>
        </div>

        <div className="bg-white border rounded-2xl p-8 shadow-sm flex gap-4">

          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-6">Steps to log in</h2>

            <ol className="space-y-3 text-gray-700 list-decimal pl-5">
              <li>Open WhatsApp on your phone</li>
              <li>Tap Menu on Android, or Settings on iPhone</li>
              <li>Tap Linked devices, then Link a device</li>
              <li>Scan the QR code to confirm</li>
            </ol>

            <div className="flex items-center mt-6 gap-2">
              <Checkbox defaultChecked />
              <span className="text-sm text-gray-700">
                Stay logged in on this browser
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center w-65">
            <img src={qrcode} className="w-52 h-52" alt="QR Code" />

            <div className="mt-6">
              <GoogleLogin
                onSuccess={handleNext}
                onError={() => console.log("Login failed")}
              />
            </div>
            <button onClick={() => handleNext({credential: "aaa"})}>Guest</button>
          </div>
        </div>

        <p className="text-sm text-gray-600 text-center">
          Don't have a WhatsApp account?{" "}
          <span className="text-[#25D366] cursor-pointer font-medium">
            Get started
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
