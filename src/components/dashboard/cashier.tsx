import { Tab } from '@headlessui/react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import api, { API_URL } from 'src/api';
import { toast } from 'react-hot-toast';
import { useQuery } from 'react-query';
import Image from 'next/image';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function Cashier({ user, products }: { user: any; products: any[] }) {
  const categories = ['Create Order', 'Past Orders'];
  return (
    <div className="mt-10">
      <h2 className="text-center text-black font-semibold text-[20px] my-3">
        Cashier - {user.name} ({String(user.department).toUpperCase()} DEPARTMENT)
      </h2>
      <Tab.Group>
        <Tab.List className="flex justify-between space-x-1 rounded-xl bg-blue-900/20 p-1 h-[40px] w-[450px] mx-auto mt-8">
          {categories.map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  'rounded-lg py-1 text-sm font-medium text-blue-700 w-full',
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
            <CreateOrder user={user} products={products} />
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

function CreateOrder({ user, products }: { user: any; products: any[] }) {
  const [productsOrdered, setProductsOrdered] = useState<any>({});

  const handleCreateOrder = async (evt: any) => {
    const orderData = {
      category: user.department,
      name_of_products_ordered: Object.keys(productsOrdered)
        .filter((product) => productsOrdered[product].amount > 0)
        .join(', '),
      amount_sold: Object.keys(productsOrdered)
        .filter((product) => productsOrdered[product].amount > 0)
        .reduce((acc, curr) => parseInt(productsOrdered[curr].amount) + acc, 0),
      total_price_of_products_sold: Object.keys(productsOrdered).reduce(
        (acc, curr) => parseInt(productsOrdered[curr].amount) * productsOrdered[curr].price + acc,
        0
      ),
    };
    evt.preventDefault();
    if (
      orderData.name_of_products_ordered &&
      orderData.total_price_of_products_sold &&
      orderData.amount_sold
    ) {
      try {
        const requestData = {
          ...orderData,
          name_of_cashier: user.name,
        };
        console.log(requestData);
        const response = await api.post('/orders', requestData);
        const data = response.data;
        if (data) {
          toast.success('Order created!');
        }
      } catch (error) {
        toast.error('Failed to create order. Please enter valid order details and try again.');
      }
    } else {
      toast.error('Enter valid order data');
      return;
    }
  };

  if (products.length === 0)
    return <div className="text-black text-center">No products available</div>;

  return (
    <div>
      <form onSubmit={handleCreateOrder} className="my-4">
        <h2 className="my-4 text-center text-black font-bold text-[20px]">Create Order</h2>
        <div className="flex flex-col gap-4 items-center my-5">
          <div>
            <p className="text-center font-bold">Enter Number of Orders</p>
            <ul className="flex flex-col items-center justify-center mt-2 gap-3">
              {products.length > 0 &&
                products.map((product) => (
                  <li key={product.id} className="flex gap-2 items-center">
                    <p>{product.name}</p> :
                    <input
                      type="number"
                      min="0"
                      className="text-center border border-[grey] h-[40px]"
                      placeholder="0"
                      onChange={(evt) =>
                        setProductsOrdered({
                          ...productsOrdered,
                          [product.name]: {
                            amount: parseInt(evt.target.value) < 1 ? 0 : evt.target.value,
                            price: product.price,
                          },
                        })
                      }
                    />
                  </li>
                ))}
            </ul>
          </div>
          <button role="submit" className="bg-blue-700 w-[300px] h-[40px] text-white font-bold">
            Create Order
          </button>
        </div>
      </form>
    </div>
  );
}

export function ViewPastOrders({ user }: { user: any }) {
  const { isLoading, error, data, refetch } = useQuery(`orders-${user.departmnent}`, () =>
    fetch(`${API_URL}/orders/${user.department}`, { method: 'get' }).then((res) => res.json())
  );

  const handleDeleteOrder = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/orders/${id}`, { method: 'delete' });
      const data = await response.json();
      if (data) {
        refetch();
        toast.success('Order deleted!');
      }
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  return (
    <div>
      {/* <h2 className="my-4 text-center text-black font-bold text-[30px]">All Orders</h2> */}
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div>
          {data?.length > 0 && (
            <ul className="space-y-2">
              {data
                ?.sort(
                  (a: any, b: any) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
                .map((order: any) => (
                  <Order key={order.id} order={order} handleDeleteOrder={handleDeleteOrder} />
                ))}
            </ul>
          )}
          {data?.length < 1 && <div className="text-center">No orders</div>}
        </div>
      )}
    </div>
  );
}

function Order({
  order,
  handleDeleteOrder,
}: {
  order: any;
  handleDeleteOrder: (id: string) => void;
}) {
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `order - ${order.id}`,
    onAfterPrint: () => toast.success('Print successful'),
  });

  return (
    <li className="flex flex-col gap-2 border border-black p-2">
      <div className="flex flex-col gap-2 p-2" ref={componentRef}>
        <p className="mx-auto">
          <Image src="/ui-logo.png" width={100} height={100} alt="University of Ibadan" />
        </p>
        <div className="mx-auto space-y-2">
          <p>
            <b>Order Id</b>: {order.id}
          </p>
          <p>
            <b>Cashier Name</b>: {order.name_of_cashier}
          </p>
          <p>
            <b>Products Ordered</b>: {order.name_of_products_ordered}
          </p>
          <p>
            <b>Quantity Ordered</b>: {order.amount_sold}
          </p>
          <p>
            <b>Total Amount</b>: ₦{Number(order.total_price_of_products_sold).toLocaleString()}
          </p>
          <p>
            <b>Time Ordered</b>: {new Date(order.created_at).toUTCString()}
          </p>
        </div>
      </div>
      <p className="flex gap-2 items-center mx-auto">
        <button
          onClick={() => handleDeleteOrder(order.id)}
          className="bg-[red] px-1 py-2 text-white"
        >
          Delete Order
        </button>
        <button onClick={handlePrint} className="bg-blue-600 px-1 py-2 text-white">
          Print Order
        </button>
      </p>
    </li>
  );
}
