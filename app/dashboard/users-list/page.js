'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getUsers } from '@/app/action';
import Pagination from '@/components/Pagination'; // Adjust path as needed
import Link from 'next/link';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsers();
        
        if (!data || !data.success) {
          setError('Failed to load users');
          return;
        }
        
        setUsers(data.users || []);
      } catch (err) {
        setError('Failed to load users');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Filter out admin users - only show regular users
  const regularUsers = users.filter(user => user.role !== 'admin');
  
  // Calculate pagination
  const totalPages = Math.ceil(regularUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = regularUsers.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Users List</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Users List</h1>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Failed to Load Users
          </h2>
          <p className="text-gray-600">
            There was an error loading the users. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Users List</h1>
      
      {regularUsers.length > 0 ? (
        <>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4 font-semibold text-gray-700">Profile</th>
                    <th className="p-4 font-semibold text-gray-700">Name</th>
                    <th className="p-4 font-semibold text-gray-700">Email</th>
                    <th className="p-4 font-semibold text-gray-700">Location</th>
                    <th className="p-4 font-semibold text-gray-700">Role</th>
                    <th className="p-4 font-semibold text-gray-700">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr 
                      key={user._id} 
                      className="border-t hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <Link href={`/profile/${user._id}`}>
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={`${user.name} profile`}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover cursor-pointer"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer">
                              <span className="text-gray-600 text-sm font-medium">
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          )}
                        </Link>
                      </td>
                      <td className="p-4 font-medium text-gray-800">
                        <Link 
                          href={`/profile/${user._id}`}
                          className="hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          {user.name}
                        </Link>
                      </td>
                      <td className="p-4 text-gray-600">
                        {user.email}
                      </td>
                      <td className="p-4 text-gray-600">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                          </svg>
                          {user.location || 'Not specified'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        {user.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'N/A'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination and Stats */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, regularUsers.length)} of {regularUsers.length} users
            </div>
            
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
              />
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Users Found
          </h2>
          <p className="text-gray-600">
            There are no users registered in the system yet.
          </p>
        </div>
      )}
    </div>
  );
}