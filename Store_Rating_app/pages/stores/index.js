import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

export default function ExploreStores() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [stores, setStores] = useState([
    { 
      id: 1, 
      name: 'Airplane Stores', 
      address: 'Zweibrückenstraße 8', 
      userRating: null, 
      averageRating: 4.5 
    },
    { 
      id: 2, 
      name: 'Coffee Haven', 
      address: 'Zweibrückenstraße 3', 
      userRating: null, 
      averageRating: 4.0 
    },
    { 
      id: 3, 
      name: 'Tech Gadgets', 
      address: 'Einbrückenstraße 1', 
      userRating: null, 
      averageRating: 4.2 
    },
    { 
      id: 4, 
      name: 'Fashion Hub', 
      address: 'Main Street 42', 
      userRating: null, 
      averageRating: 4.1 
    },
    { 
      id: 5, 
      name: 'Bookworm Corner', 
      address: 'Library Lane 12', 
      userRating: null, 
      averageRating: 4.3 
    },
    { 
      id: 6, 
      name: 'Healthy Eats', 
      address: 'Green Avenue 7', 
      userRating: null, 
      averageRating: 3.9 
    }
  ]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Enhanced authentication check
    const checkAuth = async () => {
      if (status === 'loading') return;
      
      if (status === 'unauthenticated') {
        router.push('/login');
        return;
      }
      
      // Fetch user's previous ratings
      fetchUserRatings();
    };
    
    checkAuth();
  }, [status, router, session]);
  
  // Function to fetch user's previous ratings
  const fetchUserRatings = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/ratings/user/${session.user.id}`);
      // const data = await response.json();
      
      // For demo, we'll simulate some user ratings
      const userRatings = [
        { storeId: 3, rating: 4 }
      ];
      
      // Update stores with user's ratings
      setStores(prevStores => 
        prevStores.map(store => {
          const userRating = userRatings.find(r => r.storeId === store.id);
          return userRating 
            ? { ...store, userRating: userRating.rating } 
            : store;
        })
      );
    } catch (error) {
      console.error('Error fetching user ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };
  
  // Filter stores based on search term
  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Pagination logic
  const indexOfLastStore = currentPage * itemsPerPage;
  const indexOfFirstStore = indexOfLastStore - itemsPerPage;
  const currentStores = filteredStores.slice(indexOfFirstStore, indexOfLastStore);
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleRating = (storeId, rating) => {
    // Update the rating for a specific store
    setStores(stores.map(store => 
      store.id === storeId ? { ...store, userRating: rating } : store
    ));
  };
  
  const submitRating = async (storeId) => {
    if (!session?.user?.id) {
      setError('You must be logged in to submit a rating');
      return;
    }
    
    const store = stores.find(s => s.id === storeId);
    if (!store || !store.userRating) {
      setError('Please select a rating before submitting');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/ratings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     storeId,
      //     userId: session.user.id,
      //     rating: store.userRating
      //   })
      // });
      
      // if (!response.ok) throw new Error('Failed to submit rating');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(`Your rating for ${store.name} has been submitted!`);
      
      // Update the average rating (in a real app, this would come from the API)
      const newAverage = (store.averageRating * 10 + store.userRating) / 11;
      setStores(stores.map(s => 
        s.id === storeId ? { ...s, averageRating: parseFloat(newAverage.toFixed(1)) } : s
      ));
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
        <h1 className="text-3xl font-bold mb-6">Explore Stores</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input
              type="search"
              className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white"
              placeholder="Search by Name or Address..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
        
        {/* Stores List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Stores List</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentStores.map((store) => (
              <div key={store.id} className="grid grid-cols-2 bg-white rounded-lg shadow">
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{store.name}</h3>
                  <p className="text-sm text-gray-600">Address: {store.address}</p>
                  <p className="text-sm text-gray-600 mt-1">Average Rating: {store.averageRating}/5</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {store.userRating ? 'Your Rating: ' + store.userRating + '/5' : 'Not Rated Yet'}
                  </p>
                </div>
                <div className="p-4 flex flex-col items-center justify-center">
                  <p className="text-sm mb-1">Your Rating</p>
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(store.id, star)}
                        className="text-2xl text-yellow-400 focus:outline-none"
                        disabled={submitting}
                      >
                        {star <= (store.userRating || 0) ? "★" : "☆"}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => submitRating(store.id)}
                    className={`px-4 py-1 text-sm text-white rounded ${
                      store.userRating ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300'
                    }`}
                    disabled={!store.userRating || submitting}
                  >
                    {submitting ? 'Submitting...' : (store.userRating ? 'Submit Rating' : 'Select Rating')}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="inline-flex">
                <button 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  &larr;
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-1 border border-gray-300 text-sm font-medium ${
                      currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  &rarr;
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}