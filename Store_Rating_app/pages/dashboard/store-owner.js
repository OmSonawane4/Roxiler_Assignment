import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

export default function StoreOwnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [storeData, setStoreData] = useState({
    averageRating: 4.5,
    recentRatings: [
      { id: 1, userName: 'John Smith', userEmail: 'john.s@email.com', rating: 5, date: '2023-10-26' },
      { id: 2, userName: 'Jane', userEmail: 'jane.d@email.com', rating: 4, date: '2023-10-25' },
      { id: 3, userName: 'Jane Doe', userEmail: 'jane.d@email.com', rating: 4, date: '2023-10-25' },
      { id: 4, userName: 'Maria Gomez', userEmail: 'maria@email.com', rating: 5, date: '2023-10-24' }
    ]
  });

  useEffect(() => {
    // Check if user is authenticated and is a store owner
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session && session.user.role !== 'store_owner') {
      router.push('/dashboard');
    }
    
    // In a real app, you would fetch store data here
    // Example: fetchStoreData(session.user.id)
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Store Owner Dashboard</h1>
        
        {/* Average Rating Card */}
        <div className="bg-blue-100 rounded-lg p-6 mb-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-2">{storeData.averageRating} / 5</h2>
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-2xl text-yellow-400">
                  {i < Math.floor(storeData.averageRating) ? "★" : (i < storeData.averageRating ? "★" : "☆")}
                </span>
              ))}
            </div>
            <p className="text-gray-600">Average Store Rating</p>
          </div>
        </div>
        
        {/* Recent Ratings Table */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Customer Ratings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">User Name</th>
                  <th className="py-2 px-4 text-left">User Email</th>
                  <th className="py-2 px-4 text-center">Rating Value</th>
                  <th className="py-2 px-4 text-right">Date Submitted</th>
                </tr>
              </thead>
              <tbody>
                {storeData.recentRatings.map((rating) => (
                  <tr key={rating.id} className="border-b">
                    <td className="py-2 px-4">{rating.userName}</td>
                    <td className="py-2 px-4">{rating.userEmail}</td>
                    <td className="py-2 px-4 text-center">{rating.rating}</td>
                    <td className="py-2 px-4 text-right">{rating.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center mt-4">
            <nav className="inline-flex">
              <button className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                &larr;
              </button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  className={`px-3 py-1 border border-gray-300 text-sm font-medium ${
                    page === 1 ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                &rarr;
              </button>
            </nav>
          </div>
        </div>
      </div>
    </Layout>
  );
}