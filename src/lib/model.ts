// ********************************************************
// **************v******** Comment ************************
// ********************************************************

export enum CommentStatus {
    Approved,
    Pending = 1
}
export class Comment {
    id: number;
    createdAt: number;
    authorName: string;
    parentID: number;
    path: string;
    mail: string;
    url: string;
    text: string;
    status: CommentStatus;
    agent: string;
    points: number;
    children: Comment[];

    constructor() {
        this.id = 0;
        this.createdAt = new Date().getTime();
        this.authorName = "";
        this.parentID = 0;
        this.path = "";
        this.mail = "";
        this.url = "";
        this.text = "";
        this.status = CommentStatus.Approved;
        this.agent = "";
        this.points = 0;
        this.children = [];
    }
}

// ********************************************************
// ****************v******** User *************************
// ********************************************************

export enum UserRole {
    ADMIN = 'admin',
    READER = 'reader',
}

export interface IUser {
    id: number | string;
    username: string;
    email: string;
    url?: string;
    avatar: string;
    role: string;
    createdAt?: number;
    updatedAt?: number;
    activated?: boolean;
}

export class User implements IUser {
    id: number | string;
    username: string;
    email: string;
    url: string;
    avatar: string;
    createdAt: number;
    updatedAt: number;
    activated: boolean;
    role: string;

    constructor() {
        this.id = 0;
        this.username = '';
        this.email = '';
        this.url = '';
        this.avatar = '';
        this.createdAt = Date.now();
        this.updatedAt = Date.now();
        this.activated = false;
        this.role = UserRole.READER;
    }
}

// ********************************************************
// ****************v******** Tag **************************
// ********************************************************

export class Tag {
    id: number;
    slug: string;
    text: string;
    path: string;
    readablePath: string;
    parentID: number;
    depth: number;
    children: Tag[];

    constructor() {
        this.depth = 0;
        this.id = 0;
        this.slug = "";
        this.text = '';
        this.path = '';
        this.readablePath = '';
        this.parentID = 0;
        this.children = [];
    }
}

// ********************************************************
// **************v******** Post ************************
// ********************************************************

export enum ContentType {
    POST = 'post',
    DIGU = 'digu',
    PAGE = 'page',
}

export enum ContentStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    PENDING = 'pending',
}

export class PaginationType {
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    total: number;

    constructor() {
        this.pageIndex = 0;
        this.pageSize = 10;
        this.total = 0;
        this.totalPages = 0;
    }
}

export class Category {
    id?: number;
    text: string;
    slug: string;
    checked: boolean;

    constructor() {
        this.id = 0;
        this.text = '';
        this.slug = '';
        this.checked = false;
    }
}

export class Post {
    id: number;
    slug: string;
    type: ContentType;
    title: string;
    abstract: string;
    text: string;
    authorID: number | string;
    author: User;
    createdAt: number;
    updatedAt: number;
    publishAt: number;
    status: ContentStatus;
    tags: Tag[];
    viewsNum: number;
    commentsNum: number;
    category: Category;

    constructor() {
        this.id = 0;
        this.slug = '';
        this.type = ContentType.POST;
        this.title = '';
        this.abstract= '';
        this.text = '';
        this.authorID = 0;
        this.author = new User();
        this.createdAt = new Date().getTime();
        this.updatedAt = new Date().getTime();
        this.publishAt = new Date().getTime();
        this.status = ContentStatus.PUBLISHED;
        this.tags = [];
        this.viewsNum = 0;
        this.commentsNum = 0;
        this.category = new Category();
    }
}
