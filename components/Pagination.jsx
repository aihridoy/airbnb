import React from 'react';

const Pagination = ({ handlePageChange, currentPage, totalPages }) => {
    return (
        <nav aria-label="Page navigation">
            <ul className="inline-flex items-center -space-x-px">
                <li>
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                        className={`block py-2 px-3 ml-0 leading-tight text-zinc-500 bg-white rounded-l-lg border border-zinc-300 hover:bg-zinc-100 hover:text-zinc-700 ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                    >
                        <span className="sr-only">Previous</span>
                        <i className="fas fa-chevron-left"></i>
                    </a>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                    <li key={i}>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }}
                            className={`py-2 px-3 leading-tight text-zinc-500 bg-white border border-zinc-300 hover:bg-zinc-100 hover:text-zinc-700 ${currentPage === i + 1 ? 'bg-zinc-200' : ''}`}
                        >
                            {i + 1}
                        </a>
                    </li>
                ))}
                <li>
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                        className={`block py-2 px-3 leading-tight text-zinc-500 bg-white rounded-r-lg border border-zinc-300 hover:bg-zinc-100 hover:text-zinc-700 ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                    >
                        <span className="sr-only">Next</span>
                        <i className="fas fa-chevron-right"></i>
                    </a>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;