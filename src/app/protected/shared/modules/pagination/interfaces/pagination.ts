import { PaginationLink } from './pagination-link';

export interface Pagination {

    current_page: number,

    first_page_url: string,

    from: number,

    last_page: number,

    last_page_url: string,

    links: PaginationLink[],

    next_page_url: string,

    path: string,

    per_page: number,

    prev_page_url: string,

    to: number,

    total: number

}