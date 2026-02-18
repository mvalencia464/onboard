export interface MGRCustomer {
    id: string;
    business_name: string;
    email?: string;
    phone?: string;
}

export interface MGRReview {
    id: string;
    review: string; // The actual review text
    body?: string; // Fallback
    text?: string; // Fallback
    content?: string; // Fallback
    reviewer?: {
        name: string;
    };
    author_name?: string; // Fallback
    name?: string; // Fallback
    rating: number | { score: number };
    reviewer_location?: string;
    created_at: string | number;
}

interface MGRPagination {
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    total: number;
}

interface MGRResponse {
    data: MGRReview[];
    pagination: MGRPagination;
}

interface MGRCustomerResponse {
    data: MGRCustomer[];
    pagination: MGRPagination;
}

const API_KEY = process.env.MOREGOODREVIEWS_API_KEY;

export async function fetchCustomers(): Promise<MGRCustomer[]> {
    if (!API_KEY) {
        console.error('MoreGoodReviews API Key is missing');
        return [];
    }

    try {
        const response = await fetch('https://api.moregoodreviews.com/beacon/customers', {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch customers: ${response.statusText}`);
        }

        const result: MGRCustomerResponse = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error fetching customers from MoreGoodReviews:', error);
        return [];
    }
}

export async function fetchReviewsForCustomer(customerId: string): Promise<MGRReview[]> {
    if (!API_KEY) {
        console.error('MoreGoodReviews API Key is missing');
        return [];
    }

    const BASE_URL = `https://api.moregoodreviews.com/beacon/customers/${customerId}/reviews`;
    let allReviews: MGRReview[] = [];
    let currentPage = 1;
    let lastPage = 1;

    try {
        do {
            console.log(`Fetching reviews for customer ${customerId}, page ${currentPage}...`);
            const response = await fetch(`${BASE_URL}?page=${currentPage}`, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch reviews: ${response.statusText}`);
            }

            const result: MGRResponse = await response.json();
            console.log(`Page ${currentPage} result:`, {
                dataLength: result.data?.length,
                pagination: result.pagination
            });

            if (!result.data || !Array.isArray(result.data)) {
                console.warn('Result data is missing or not an array:', result);
                break;
            }

            allReviews = [...allReviews, ...result.data];

            if (result.pagination) {
                lastPage = result.pagination.last_page;
            } else {
                console.warn('Pagination data is missing, stopping at page 1');
                lastPage = 1;
            }

            currentPage++;

        } while (currentPage <= lastPage);

        return allReviews;
    } catch (error) {
        console.error(`Error fetching reviews for customer ${customerId}:`, error);
        return [];
    }
}

export async function fetchAllReviews(): Promise<MGRReview[]> {
    if (!API_KEY) {
        console.error('MoreGoodReviews API Key is missing');
        return [];
    }

    const BASE_URL = 'https://api.moregoodreviews.com/beacon/reviews';
    let allReviews: MGRReview[] = [];
    let currentPage = 1;
    let lastPage = 1;

    try {
        do {
            const response = await fetch(`${BASE_URL}?page=${currentPage}`, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch reviews: ${response.statusText}`);
            }

            const result: MGRResponse = await response.json();
            allReviews = [...allReviews, ...result.data];

            lastPage = result.pagination.last_page;
            currentPage++;

        } while (currentPage <= lastPage);

        return allReviews;
    } catch (error) {
        console.error('Error fetching all reviews from MoreGoodReviews:', error);
        return [];
    }
}

