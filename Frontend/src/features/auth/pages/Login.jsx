import { useState } from "react";
import "../auth.form.scss";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import LoadingScreen from "../../../components/LoadingScreen";
const Login = () => {
const navigate = useNavigate()
const {loading, handleLogin} = useAuth()
const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [showPassword, setShowPassword] = useState(false)
const [error, setError] = useState("")
const [submitting, setSubmitting] = useState(false)
const handleSubmit = async(e) =>{
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      await handleLogin({email,password})
      navigate('/')
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to sign in. Please try again.")
    } finally {
      setSubmitting(false)
    }
}

if(loading){
    return <LoadingScreen label="Checking your session..." />
}

    return (
        <main className="auth-page">
            <div className="auth-card">

                {/* Left Side */}
                <div className="auth-left">
                    <div className="brand">
                        <div className="brand-icon">✦</div>
                        <span>Resume Generate</span>
                    </div>

                    <div className="welcome-content">
                        <h1>Welcome Back</h1>

                        <p>
                            Sign in to your account and continue
                            building your professional future.
                        </p>
                    </div>

                    <div className="security-info">
                        <span>🔒</span>
                        <div>
                            <strong>Secure & Private</strong>
                            <small>Your data is protected</small>
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div className="auth-right">

                    <div className="form-header">
                        <h2>Login</h2>
                        <p>Enter your details to access your account</p>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {error && <p className="form-error" role="alert">{error}</p>}

                        <div className="input-group">
                            <label htmlFor="email">
                                Email Address
                            </label>

                            <div className="input-wrapper">
                                <span className="input-icon">✉</span>

                                <input
                                    value={email}
                                    onChange={(e)=>{setEmail(e.target.value)}}
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email address"
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="input-wrapper">
                                <span className="input-icon">🔒</span>

                                {/* <input
                                    value={password}
                                    onChange={(e)=>{setPassword(e.target.value)}}
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    required
                                    minLength="6"

                                /> */}
                                <input
                                    onChange={(e) => setPassword(e.target.value)}
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                />

                                <button
                                    type="button"
                                    className="password-icon"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? "🙈" : "👁"}
                                </button>

                                {/* <span className="password-icon">◉</span> */}
                            </div>
                        </div>

                        <div className="form-options">

                            {/* <label className="remember">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label> */}

                            {/* <a href="/forgot-password">
                                Forgot password?
                            </a> */}

                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="login-button"
                        >
                            {submitting ? 'Signing in...' : 'Login'}
                            <span>→</span>
                        </button>

                    </form>

                    <div className="divider">
                        <span></span>
                        <p>OR</p>
                        <span></span>
                    </div>

                    <p className="register-link">
                        Don't have an account?
                        <Link to={"/register"}> Sign up</Link>
                    </p>

                </div>

            </div>
        </main>
    );
};

export default Login;
