import {useState} from "react";
import "../auth.form.scss";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import LoadingScreen from "../../../components/LoadingScreen";
const Register = () => {
const navigate = useNavigate();
const {loading, handleRegister} = useAuth()
const [username,setUsername] = useState("")
const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [error, setError] = useState("")
const [submitting, setSubmitting] = useState(false)
const handleSubmit = async(e) =>{
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      await handleRegister({username,email,password})
      navigate('/login')
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create your account. Please try again.")
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
                        <h1>Create Your Account</h1>

                        <p>
                            Join us and start building your
                            professional resume today.
                        </p>
                    </div>

                    <div className="security-info">
                        <span>✨</span>
                        <div>
                            <strong>Build Your Future</strong>
                            <small>Create professional resumes easily</small>
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div className="auth-right">

                    <div className="form-header">
                        <h2>Create Account</h2>
                        <p>Fill in your details to get started</p>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {error && <p className="form-error" role="alert">{error}</p>}

                        <div className="input-group">
                            <label htmlFor="username">
                                Username
                            </label>

                            <div className="input-wrapper">
                                <span className="input-icon">👤</span>

                                <input
                                    onChange={(e)=>{setUsername(e.target.value)}}
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder="Enter your user name"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="email">
                                Email Address
                            </label>

                            <div className="input-wrapper">
                                <span className="input-icon">✉</span>

                                <input
                                    onChange={(e)=>{setEmail(e.target.value)}}
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email address"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="input-wrapper">
                                <span className="input-icon">🔒</span>

                                <input
                                    onChange={(e)=>{setPassword(e.target.value)}}
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Create a password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="login-button"
                        >
                            {submitting ? 'Creating account...' : 'Create Account'}
                            <span>→</span>
                        </button>

                    </form>

                    <div className="divider">
                        <span></span>
                        <p>OR</p>
                        <span></span>
                    </div>

                    <p className="register-link">
                        Already have an account?
                        <Link to={"/login"}> Login</Link>
                    </p>

                </div>

            </div>
        </main>
    );
};

export default Register;
