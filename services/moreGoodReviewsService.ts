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

const API_KEY = process.env.MOREGOODREVIEWS_API_KEY;
const BASE_URL = 'https://api.moregoodreviews.com/beacon/reviews';

export async function fetchAllReviews(): Promise<MGRReview[]> {
    if (!API_KEY) {
        console.error('MoreGoodReviews API Key is missing');
        return [];
    }

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
