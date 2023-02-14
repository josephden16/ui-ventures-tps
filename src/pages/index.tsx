import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/router';
import api from 'src/api';
import { accountTypes, departments } from 'src/constant';
import toast from 'react-hot-toast';

type LoginInfo = {
  email: string;
  password: string;
};

type SignupInfo = {
  name: string;
  email: string;
  password: string;
  role: string | null;
  department: string | null;
};

export default function Home() {
  const [loginView, setLoginView] = useState(true);

  const viewLogin = () => setLoginView(true);

  const viewSignup = () => setLoginView(false);

  return (
    <>
      <Head>
        <title>UI Ventures - TPS</title>
        <meta name="description" content="UI Ventures - Transaction Processing System" />
      </Head>
      <main className="flex flex-col items-center jusitfy-center w-full h-screen pt-4 pb-10">
        <Image src="/ui-logo.png" width={100} height={100} alt="University of Ibadan" />
        <h1 className="mb-[30px] text-[40px] text-black text-center">UI Ventures - TPS</h1>
        {loginView ? <Login viewSignup={viewSignup} /> : <SignUp viewLogin={viewLogin} />}
      </main>
    </>
  );
}

function Login({ viewSignup }: { viewSignup: () => void }) {
  const [loading, setLoading] = useState(false);
  const [loginInfo, setLoginInfo] = useState<LoginInfo>({ email: '', password: '' });
  const router = useRouter();

  const handleLogin = async (evt: any) => {
    evt.preventDefault();
    if (loginInfo.email && loginInfo.password) {
      try {
        setLoading(true);
        const response = await api.post('/auth/sign-in', loginInfo);
        console.log(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        setLoading(false);
        router.push('/dashboard');
      } catch (error) {
        setLoading(false);
        toast.error('Login failed. Please enter a valid login details and try again.');
      }
    } else {
      toast.error('Enter valid login info');
      return;
    }
  };

  return (
    <form onSubmit={handleLogin} className="">
      <h2 className="text-center text-black font-bold text-[30px]">Login</h2>
      <div className="flex flex-col gap-4 items-center my-5">
        <input
          className="border border-[grey] px-2 py-2 w-[300px] placeholder-black"
          type="email"
          name="email"
          placeholder="email"
          required
          onChange={(event) => setLoginInfo({ ...loginInfo, email: event.target.value })}
        />
        <input
          className="border border-[grey] px-2 py-2 w-[300px] placeholder-black"
          type="password"
          name="password"
          placeholder="password"
          required
          onChange={(event) => setLoginInfo({ ...loginInfo, password: event.target.value })}
        />
        <button
          disabled={loading}
          role="submit"
          className="bg-blue-700 w-[300px] h-[40px] text-white font-bold"
        >
          Log in
        </button>
      </div>
      <p className="text-center">
        Do not have an account?{' '}
        <button className="text-blue-700" onClick={viewSignup}>
          sign up
        </button>
      </p>
    </form>
  );
}

function SignUp({ viewLogin }: { viewLogin: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [signupInfo, setSignupInfo] = useState<SignupInfo>({
    name: '',
    email: '',
    password: '',
    department: null,
    role: null,
  });
  const handleSignup = async (evt: any) => {
    evt.preventDefault();
    if (signupInfo.email && signupInfo.password && signupInfo.department && signupInfo.role) {
      try {
        setLoading(true);
        const response = await api.post('/auth/sign-up', signupInfo);
        console.log(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        setLoading(false);
        router.push('/dashboard');
      } catch (error) {
        toast.error('Signup failed. Please enter a valid sign up details and try again.');
        setLoading(false);
      }
    } else {
      toast.error('Enter valid signup info');
      setLoading(false);
      return;
    }
  };
  return (
    <form onSubmit={handleSignup} className="pb-10">
      <h2 className=" text-center text-black font-bold text-[30px]">Sign up</h2>
      <div className="flex flex-col gap-4 items-center my-5">
        <input
          className="border border-[grey] px-2 py-2 w-[300px] placeholder-black"
          type="text"
          name="name"
          placeholder="name"
          required
          onChange={(event) => setSignupInfo({ ...signupInfo, name: event.target.value })}
        />
        <input
          className="border border-[grey] px-2 py-2 w-[300px] placeholder-black"
          type="email"
          name="email"
          placeholder="email"
          required
          onChange={(event) => setSignupInfo({ ...signupInfo, email: event.target.value })}
        />
        <input
          className="border border-[grey] px-2 py-2 w-[300px] placeholder-black"
          type="password"
          name="password"
          placeholder="password"
          required
          onChange={(event) => setSignupInfo({ ...signupInfo, password: event.target.value })}
        />
        <select
          name="account-type"
          className="border border-[grey] placeholder-black py-2 px-2 w-[300px]"
          onChange={(event) => setSignupInfo({ ...signupInfo, role: event.target.value })}
          required
        >
          <option value="">select account type</option>
          {accountTypes.map((account) => (
            <option key={account} value={account}>
              {account}
            </option>
          ))}
        </select>
        <select
          name="department"
          className="border border-[grey] py-2 px-2 w-[300px] placeholder-black"
          onChange={(event) => setSignupInfo({ ...signupInfo, department: event.target.value })}
          required
        >
          <option value="">select department</option>
          {departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
        <button
          disabled={loading}
          role="submit"
          className="bg-blue-700 w-[300px] h-[40px] text-white font-bold"
        >
          Sign up
        </button>
      </div>
      <p className="text-center">
        Already have an account?{' '}
        <button className="text-blue-700" onClick={viewLogin}>
          log in
        </button>
      </p>
    </form>
  );
}
