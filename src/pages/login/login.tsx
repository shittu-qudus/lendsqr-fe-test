import React, { useState } from 'react';
import styles from './Login.module.scss';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setError('');
    console.log('Logging in with:', { email, password });
    navigate('/dashboard');
  };

  return (
    <main className={styles.loginContainer}>

      <section className={styles.leftSection} aria-label="Branding">
        <header className={styles.logoWrapper} style={{ paddingLeft: '30px' }}>
          <img src="/logo.png" alt="Lendsqr" className={styles.logo} />
        </header>
        <figure className={styles.illustrationWrapper}>
          <img src="/image.png" alt="Person managing finances online" className={styles.illustration} />
        </figure>
      </section>

      <section className={styles.rightSection} aria-label="Login">
        <div className={styles.formWrapper}>
          <h1 className={styles.welcomeTitle}>Welcome!</h1>
          <p className={styles.subtitle} id="login-subtitle">Enter details to login.</p>

          {error && (
            <p role="alert" aria-live="assertive" className={styles.errorMessage}>
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <fieldset className={styles.fieldset}>
              <legend className={styles.srOnly}>Account credentials</legend>

              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.srOnly}>Email address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  autoComplete="email"
                  aria-required="true"
                />
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.passwordWrapper}>
                  <label htmlFor="password" className={styles.srOnly}>Password</label>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.passwordInput}
                    autoComplete="current-password"
                    aria-required="true"
                  />
                  <button
                    type="button"
                    className={styles.showButton}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-controls="password"
                    aria-pressed={showPassword}
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>
            </fieldset>

            <div className={styles.forgotPassword}>
              <a href="/forgot-password" className={styles.forgotLink}>
                FORGOT PASSWORD?
              </a>
            </div>

            <button type="submit" className={styles.loginButton}>
              LOG IN
            </button>
          </form>
        </div>
      </section>

    </main>
  );
};

export default Login;