import { Tab } from '@headlessui/react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useQuery } from 'react-query';
import api, { API_URL } from 'src/api';
import { ViewPastOrders } from './cashier';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function Admin({ user }: { user: any }) {
  const categories = ['Create Product', 'Products', 'Past Orders'];
  return (
    <div className="">
      <h2 className="text-center text-black font-semibold text-[20px]">
        Admin - {user.name} ({String(user.department).toUpperCase()} DEPARTMENT)
      </h2>
      <Tab.Group>
        <Tab.List className="flex space-x-1 w-full rounded-xl bg-blue-900/20 p-1 mt-8">
          {categories.map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected ? 'bg-white shadow' : 'text-black hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel
            className={classNames(
              'rounded-xl bg-white p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
            )}
          >
            <CreateProduct user={user} />
          </Tab.Panel>
          <Tab.Panel
            className={classNames(
              'rounded-xl bg-white p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
            )}
          >
            <ViewProducts user={user} />
          </Tab.Panel>
          <Tab.Panel
            className={classNames(
              'rounded-xl bg-white p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
            )}
          >
            <ViewPastOrders user={user} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

export function CreateProduct({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);

  const handleCreateProduct = async (evt: any) => {
    evt.preventDefault();
    if (productInfo.name && parseInt(productInfo.price) && parseInt(productInfo.stock)) {
      setLoading(true);
      try {
        const requestData = {
          ...productInfo,
          description: productInfo.name,
          category: user.department,
        };
        console.log(requestData);
        const response = await api.post('/products', requestData);
        const data = response.data;
        if (data) {
          toast.success('Product created!');
        }
        setLoading(false);
      } catch (error) {
        toast.error(
          'Failed to create product. Please enter a valid product details and try again.'
        );
      }
    } else {
      setLoading(false);
      toast.error('Enter valid product data');
      return;
    }
  };

  const [productInfo, setProductInfo] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
  });

  return (
    <div>
      <form onSubmit={handleCreateProduct} className="my-4">
        <h2 className="my-4 text-center text-black font-bold text-[30px]">Create Product</h2>
        <div className="flex flex-col gap-4 items-center my-5">
          <input
            className="border border-[grey] px-2 py-2 w-[300px] placeholder-black"
            type="text"
            name="name"
            placeholder="name"
            required
            onChange={(event) => setProductInfo({ ...productInfo, name: event.target.value })}
          />
          <input
            className="border border-[grey] px-2 py-2 w-[300px] placeholder-black"
            type="number"
            name="price"
            placeholder="price"
            min={0}
            required
            onChange={(event) =>
              setProductInfo({
                ...productInfo,
                price: parseInt(event.target.value) <= 0 ? '0' : event.target.value,
              })
            }
          />
          <input
            className="border border-[grey] px-2 py-2 w-[300px] placeholder-black"
            type="number"
            min={0}
            name="stock"
            placeholder="stock"
            required
            onChange={(event) => setProductInfo({ ...productInfo, stock: event.target.value })}
          />
          <button
            disabled={loading}
            role="submit"
            className="bg-blue-700 w-[300px] h-[40px] text-white font-bold"
          >
            Create Product
          </button>
        </div>
      </form>
    </div>
  );
}

export function ViewProducts({ user }: { user: any }) {
  const { isLoading, error, data, refetch } = useQuery(`products-${user.departmnent}`, () =>
    fetch(`${API_URL}/products/${user.department}`, { method: 'get' }).then((res) => res.json())
  );

  const handleProductDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, { method: 'delete' });
      const data = await response.json();
      if (data) {
        refetch();
        toast.success('Product deleted!');
      }
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div>
      <h2 className="my-4 text-center text-black font-bold text-[30px]">All Products</h2>
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div>
          {data?.length > 0 && (
            <ul className="space-y-3">
              {data?.map((product: any) => (
                <li
                  key={product.id}
                  className="border border-black flex gap-2 py-2 items-center justify-center"
                >
                  <p>
                    {product.name} - ₦{product.price}
                  </p>
                  <p>
                    <button
                      className="bg-[red] text-white text-sm p-1"
                      onClick={() => handleProductDelete(product.id)}
                    >
                      Delete
                    </button>
                  </p>
                </li>
              ))}
            </ul>
          )}
          {data?.length < 1 && <div className="text-center">No Products</div>}
        </div>
      )}
    </div>
  );
}
