import React, { useState } from 'react';
import styles from './Login.module.scss';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Simple validation (you can improve this later)
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    // Fake login logic (replace with API later)
    console.log('Logging in with:', { email, password });

    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.leftSection}>
        <div className={styles.logoWrapper} style={{ paddingLeft: '30px' }}>
          <img src="/logo.png" alt="Lendsqr" className={styles.logo} />
        </div>
        <div className={styles.illustrationWrapper}>
          <img
            src="/image.png"
            alt="Login illustration"
            className={styles.illustration}
          />
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.formWrapper}>
          <h1 className={styles.welcomeTitle}>Welcome!</h1>
          <p className={styles.subtitle}>Enter details to login.</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.passwordInput}
                  required
                />
                <button
                  type="button"
                  className={styles.showButton}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <div className={styles.forgotPassword}>
              <a href="#" className={styles.forgotLink}>
                FORGOT PASSWORD?
              </a>
            </div>

            <button type="submit" className={styles.loginButton}>
              LOG IN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;