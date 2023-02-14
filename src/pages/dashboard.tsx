import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { API_URL } from 'src/api';
import Link from 'next/link';
import { Admin } from 'src/components/dashboard/admin';
import { Cashier } from 'src/components/dashboard/cashier';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'cashier' | 'admin' | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userDataInStorage = JSON.parse(localStorage.getItem('user') as string) as {
          id: string;
        };
        const userId = userDataInStorage.id;
        if (!userId) return;
        const response = await fetch(`${API_URL}/users/${userId}`, { method: 'get' });
        const data = await response.json();
        if (data) {
          setUser(data);
          setView(data.role);
        }
        setLoading(false);
      } catch (error) {
        setUser(null);
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const category = user?.department;
        const response = await fetch(`${API_URL}/products/${category}`, { method: 'get' });
        const data = await response.json();
        if (data && data.length > 0) {
          setProducts(data);
        }
      } catch (error) {
        setProducts([]);
      }
    };

    fetchProducts();
  }, [user?.department]);

  return (
    <>
      <Head>
        <title>UI Venture - TPS</title>
        <meta name="description" content="UI Ventures - Transaction Processing System" />
      </Head>
      <main className="flex flex-col items-center jusitfy-center w-full h-screen pt-4 pb-10">
        <Image src="/ui-logo.png" width={100} height={100} alt="University of Ibadan" />
        <h1 className="mb-[30px] text-[40px] text-black text-center">UI Venture - TPS</h1>
        <div>{loading && <p>Loading...</p>}</div>
        <div>{!loading && view === 'cashier' && <Cashier user={user} products={products} />}</div>
        <div>{!loading && view === 'admin' && <Admin user={user} />}</div>
        <div className="pb-10">
          {!loading && (
            <div className="text-center">
              <Link className="text-blue-500 underline" href="/">
                Go Home
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
