import { CheckCircle, LogIn, UserPlus } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface ClientAuthProps {
  mode: 'login' | 'register';
}

interface ClientAccount {
  name: string;
  email: string;
  phone: string;
  password: string;
  createdAt: string;
}

const STORAGE_KEY = 'allop.client.account';

function loadAccount(): ClientAccount | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as ClientAccount | null;
  } catch {
    return null;
  }
}

export default function ClientAuth({ mode }: ClientAuthProps) {
  const navigate = useNavigate();
  const isRegister = mode === 'register';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const title = isRegister ? 'Crea tu cuenta de cliente' : 'Accede a tu cuenta';
  const Icon = isRegister ? UserPlus : LogIn;

  const subtitle = useMemo(() => (
    isRegister
      ? 'Guarda tus datos para reservar más rápido y consultar tus próximas citas.'
      : 'Entra para continuar con tus reservas y salones guardados.'
  ), [isRegister]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (isRegister) {
      if (!name.trim() || !email.trim() || !phone.trim() || password.length < 6) {
        setMessage({ ok: false, text: 'Completa nombre, email, teléfono y una contraseña de 6 caracteres.' });
        return;
      }

      const account: ClientAccount = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
      localStorage.setItem('allop.client.session', JSON.stringify({ email: account.email, name: account.name }));
      setMessage({ ok: true, text: 'Cuenta creada. Ya puedes reservar como cliente.' });
      window.setTimeout(() => navigate('/'), 900);
      return;
    }

    const account = loadAccount();
    if (!account || account.email !== email.trim().toLowerCase() || account.password !== password) {
      setMessage({ ok: false, text: 'No encontramos una cuenta con esos datos.' });
      return;
    }

    localStorage.setItem('allop.client.session', JSON.stringify({ email: account.email, name: account.name }));
    setMessage({ ok: true, text: `Bienvenido/a, ${account.name}.` });
    window.setTimeout(() => navigate('/'), 700);
  };

  return (
    <section className="client-auth">
      <div className="container client-auth-grid">
        <div className="client-auth-copy">
          <p className="eyebrow">Allop clientes</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <div className="client-auth-points">
            <span><CheckCircle size={16} /> Reservas más rápidas</span>
            <span><CheckCircle size={16} /> Historial de citas</span>
            <span><CheckCircle size={16} /> Salones favoritos</span>
          </div>
        </div>

        <form className="client-auth-card" onSubmit={submit}>
          <div className="client-auth-icon"><Icon size={22} /></div>
          <h2>{isRegister ? 'Registro cliente' : 'Inicio de sesión'}</h2>

          {isRegister && (
            <label>
              Nombre
              <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
            </label>
          )}

          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" />
          </label>

          {isRegister && (
            <label>
              Teléfono
              <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" autoComplete="tel" />
            </label>
          )}

          <label>
            Contraseña
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} />
          </label>

          {message && <p className={`auth-message ${message.ok ? 'ok' : 'err'}`}>{message.text}</p>}

          <button className="btn btn-primary btn-lg" type="submit">
            {isRegister ? 'Crear cuenta' : 'Entrar'}
          </button>

          <p className="auth-switch">
            {isRegister ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}{' '}
            <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Inicia sesión' : 'Regístrate'}</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
