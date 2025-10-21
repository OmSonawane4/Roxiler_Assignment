import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalStores: 12,
    totalUsers: 45,
    totalRatings: 128,
    averageRating: 4.2
  });
  
  // Add state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [activities, setActivities] = useState([
    { id: 1, user: 'John Smith', action: 'Rated', store: 'Coffee Haven', date: '2023-10-26' },
    { id: 2, user: 'Jane Doe', action: 'Registered', store: '-', date: '2023-10-25' },
    { id: 3, user: 'Mike Johnson', action: 'Created Store', store: 'Airplane Stores', date: '2023-10-24' },
    { id: 4, user: 'Sarah Williams', action: 'Rated', store: 'Tech Gadgets', date: '2023-10-23' },
    { id: 5, user: 'David Lee', action: 'Updated Store', store: 'Tech Gadgets', date: '2023-10-22' },
    { id: 6, user: 'Emily Chen', action: 'Rated', store: 'Coffee Haven', date: '2023-10-21' },
    { id: 7, user: 'Robert Brown', action: 'Registered', store: '-', date: '2023-10-20' },
    { id: 8, user: 'Lisa Wang', action: 'Created Store', store: 'Fashion Hub', date: '2023-10-19' },
  ]);
  
  const [topStores, setTopStores] = useState([
    { id: 1, name: 'Coffee Haven', owner: 'Mike Johnson', rating: 4.8, reviews: 24 },
    { id: 2, name: 'Airplane Stores', owner: 'Sarah Williams', rating: 4.5, reviews: 18 },
    { id: 3, name: 'Tech Gadgets', owner: 'David Lee', rating: 4.3, reviews: 32 },
    { id: 4, name: 'Fashion Hub', owner: 'Lisa Wang', rating: 4.2, reviews: 15 },
    { id: 5, name: 'Bookworm Corner', owner: 'James Wilson', rating: 4.1, reviews: 27 },
    { id: 6, name: 'Healthy Eats', owner: 'Anna Martinez', rating: 4.0, reviews: 22 },
  ]);
  
  const [storeCurrentPage, setStoreCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Enhanced authentication check
    const checkAuth = async () => {
      if (status === 'loading') return;
      
      if (status === 'unauthenticated') {
        router.push('/login');
        return;
      }
      
      if (session && session.user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      
      // Fetch data only if authenticated as admin
      fetchAdminData();
    };
    
    checkAuth();
  }, [session, status, router]);
  
  // Function to fetch admin data
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // In a real app, these would be API calls
      // const statsResponse = await fetch('/api/admin/stats');
      // const stats = await statsResponse.json();
      // setStats(stats);
      
      // const activitiesResponse = await fetch('/api/admin/activities');
      // const activities = await activitiesResponse.json();
      // setActivities(activities);
      
      // const storesResponse = await fetch('/api/admin/top-stores');
      // const stores = await storesResponse.json();
      // setTopStores(stores);
      
      // Using mock data for now
      console.log('Fetched admin data');
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Pagination logic for activities
  const indexOfLastActivity = currentPage * itemsPerPage;
  const indexOfFirstActivity = indexOfLastActivity - itemsPerPage;
  const currentActivities = activities.slice(indexOfFirstActivity, indexOfLastActivity);
  const totalActivityPages = Math.ceil(activities.length / itemsPerPage);
  
  // Pagination logic for stores
  const indexOfLastStore = storeCurrentPage * itemsPerPage;
  const indexOfFirstStore = indexOfLastStore - itemsPerPage;
  const currentStores = topStores.slice(indexOfFirstStore, indexOfLastStore);
  const totalStorePages = Math.ceil(topStores.length / itemsPerPage);
  
  // Handle page changes
  const handleActivityPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const handleStorePageChange = (pageNumber) => {
    setStoreCurrentPage(pageNumber);
  };

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700">Total Stores</h2>
            <p className="text-3xl font-bold">{stats.totalStores}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700">Total Users</h2>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700">Total Ratings</h2>
            <p className="text-3xl font-bold">{stats.totalRatings}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700">Average Rating</h2>
            <p className="text-3xl font-bold">{stats.averageRating}</p>
          </div>
        </div>
        
        {/* Recent Activity with Pagination */}
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">User</th>
                  <th className="py-2 px-4 text-left">Action</th>
                  <th className="py-2 px-4 text-left">Store</th>
                  <th className="py-2 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {currentActivities.map((activity) => (
                  <tr key={activity.id} className="border-b">
                    <td className="py-2 px-4">{activity.user}</td>
                    <td className="py-2 px-4">{activity.action}</td>
                    <td className="py-2 px-4">{activity.store}</td>
                    <td className="py-2 px-4 text-right">{activity.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Activity Pagination */}
          <div className="flex justify-center mt-4">
            <nav className="inline-flex">
              <button 
                onClick={() => handleActivityPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                &larr;
              </button>
              {[...Array(totalActivityPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleActivityPageChange(i + 1)}
                  className={`px-3 py-1 border border-gray-300 text-sm font-medium ${
                    currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => handleActivityPageChange(Math.min(totalActivityPages, currentPage + 1))}
                disabled={currentPage === totalActivityPages}
                className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                &rarr;
              </button>
            </nav>
          </div>
        </div>
        
        {/* Top Rated Stores with Pagination */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Top Rated Stores</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">Store Name</th>
                  <th className="py-2 px-4 text-left">Owner</th>
                  <th className="py-2 px-4 text-center">Rating</th>
                  <th className="py-2 px-4 text-right">Total Reviews</th>
                </tr>
              </thead>
              <tbody>
                {currentStores.map((store) => (
                  <tr key={store.id} className="border-b">
                    <td className="py-2 px-4">{store.name}</td>
                    <td className="py-2 px-4">{store.owner}</td>
                    <td className="py-2 px-4 text-center">{store.rating}</td>
                    <td className="py-2 px-4 text-right">{store.reviews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Store Pagination */}
          <div className="flex justify-center mt-4">
            <nav className="inline-flex">
              <button 
                onClick={() => handleStorePageChange(Math.max(1, storeCurrentPage - 1))}
                disabled={storeCurrentPage === 1}
                className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                &larr;
              </button>
              {[...Array(totalStorePages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleStorePageChange(i + 1)}
                  className={`px-3 py-1 border border-gray-300 text-sm font-medium ${
                    storeCurrentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => handleStorePageChange(Math.min(totalStorePages, storeCurrentPage + 1))}
                disabled={storeCurrentPage === totalStorePages}
                className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                &rarr;
              </button>
            </nav>
          </div>
        </div>
      </div>
    </Layout>
  );
}