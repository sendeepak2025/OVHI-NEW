import { useEffect, useState } from "react";
import OtpInput from "react-otp-input";
import { Link, useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { verifyOtpApi } from "@/services/operations/auth";
import { RootState } from "@/redux/store";
function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { otpToken } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);
  let token = otpToken;
  console.log(token);
  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    await verifyOtpApi(otp, token, dispatch);
  };

  useEffect(() => {
    if (otpToken === null) {
      navigate("/login");
    }
  }, []);

  return (
   <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
  {loading ? (
    <div className="spinner" />
  ) : (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg px-6 py-8 space-y-6 border border-gray-200">
      <h1 className="text-2xl font-bold text-blue-800 text-center">Verify Your Email</h1>
      <p className="text-center text-gray-600 text-base">
        We've sent a verification code to your email. Please enter the 6-digit code below to verify your identity.
      </p>
      <form onSubmit={handleVerifyAndSignup} className="space-y-6">
        <OtpInput
          value={otp}
          onChange={setOtp}
          numInputs={6}
          renderInput={(props) => (
            <input
              {...props}
              placeholder="-"
              style={{
                boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
              }}
              className="w-12 h-12 border border-gray-300 rounded-md text-center text-xl text-blue-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          )}
          containerStyle={{
            justifyContent: "center",
            gap: "12px",
          }}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all duration-300"
        >
          Verify Email
        </button>
      </form>
      <div className="text-center">
        <Link to="/login" className="text-blue-600 hover:underline inline-flex items-center gap-1">
          <BiArrowBack />
          Back to Login
        </Link>
      </div>
    </div>
  )}
</div>

  );
}

export default VerifyEmail;
