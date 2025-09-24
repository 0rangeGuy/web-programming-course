/*
 * ЗАДАЧА 4: Создание интерфейсов для API responses
 * 
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Создайте интерфейсы для всех API ответов
 * 3. Типизируйте все функции работы с API
 * 4. Обработайте все возможные состояния загрузки и ошибок
 */

// Система работы с API интернет-магазина

// TODO: Создать интерфейсы для API ответов:
// - ApiResponse<T>: data?, success, message?, error?
// - User: id, name, email, role, avatar?
// - Product: id, name, price, description, category, images[], rating?
// - Order: id, userId, items[], totalAmount, status, createdAt
// - OrderItem: productId, quantity, price

// TODO: Создать union типы:
// - UserRole: 'admin' | 'customer' | 'manager'
// - OrderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

// Базовая функция для API запросов
let UserRole: 'admin' | 'customer' | 'manager'

let OrderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface ApiResponse<T = any> {
    success: boolean;
    data: T | null;
    error: string | null;
    date?: Date; // Добавить ? чтобы сделать необязательным
}

interface ApiResponse<T = any> {
    success: boolean;
    data: T | null;
    error: string | null;
}


interface User{
    id:number
    name:string
    email:string
    role:string
    avatar?:any
}

interface Product{
    id:number
    name:string
    price:number
    description:string
    category:string
    images:[]
    rating?:number
}

interface Order {
    id:number
    userId:number
    items: OrderItem[]
    totalAmount:number
    status:string
    createdAt:Date
}

interface OrderItem{
    productId:number
    quantity:number
    price:number
}
async function makeApiRequest(url: string, options:any) {
    
    try {
        
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Произошла ошибка',
                data: null
            };
        }
        
        return {
            success: true,
            data: data,
            error: null
        };
    } catch (error) {
        let errorMessage = null;
        
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        return {
            success: false,
            error: errorMessage,
            data: null
        };
    }
}

// Получение пользователя по ID
async function getUser(userId:number) {
    return makeApiRequest(`/api/users/${userId}`, {
        method: 'GET'
    });
}

// Получение списка товаров с фильтрами
type SortField = 'price' | 'name' | 'date';
type SortOrder = 'asc' | 'desc';

interface ProductFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    inStock?: boolean;
    sortBy?: SortField;
    sortOrder?: SortOrder;
} 

async function getProducts(filters:ProductFilters) {
    const queryParams = new URLSearchParams();
    
    if (filters.category) queryParams.set('category', filters.category);
    if (filters.minPrice) queryParams.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) queryParams.set('maxPrice', filters.maxPrice.toString());
    if (filters.search) queryParams.set('search', filters.search);
    
    return makeApiRequest(`/api/products?${queryParams}`, {
        method: 'GET'
    });
}

// Создание заказа
async function createOrder(orderData:Partial<Order>) {
    return makeApiRequest('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    });
}

// Обновление статуса заказа
async function updateOrderStatus(orderId:number, newStatus:string) {
    return makeApiRequest(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
    });
}

// Функция для обработки результатов API
function handleApiResponse<T>(
    response: ApiResponse<T>,
    onSuccess: (data: T) => void,
    onError: (error: string) => void
): void  {
    if (response.success && response.data) {
        onSuccess(response.data);
    } else {
        onError(response.error || 'Неизвестная ошибка');
    }
}

// Класс для управления состоянием загрузки
class ApiState<T = any> {
    isLoading: boolean;
    error: string | null;
    data: T | null;

    constructor() {
        this.isLoading = false;
        this.error = null;
        this.data = null;
    }
    
    setLoading(loading:boolean) {
        this.isLoading = loading;
        if (loading) {
            this.error = null;
        }
    }
    
    setData(data:T) {
        this.data = data;
        this.isLoading = false;
        this.error = null;
    }
    
    setError(error:string) {
        this.error = error;
        this.isLoading = false;
        this.data = null;
    }
    
    getState() {
        return {
            isLoading: this.isLoading,
            error: this.error,
            data: this.data
        };
    }
}

// Композитная функция для загрузки данных с состоянием
async function loadDataWithState<T>(
    apiCall: () => Promise<ApiResponse<T>>,
    state: ApiState<T>
): Promise<ApiResponse<T>> {
    state.setLoading(true);
    
    try {
        const response = await apiCall();
        
        if (response.success && response.data) {
            state.setData(response.data);
        } else {
            state.setError(response.error || 'Неизвестная ошибка');
        }
        
        return response;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
        state.setError(errorMessage);
        return {
            success: false,
            error: errorMessage,
            data: null
        };
    }
}
// Примеры использования
async function exampleUsage() {
    const userState = new ApiState();
    const productsState = new ApiState();
    
    console.log('Загружаем пользователя...');
    await loadDataWithState(() => getUser(1), userState);
    console.log('Состояние пользователя:', userState.getState());
    
    console.log('Загружаем товары...');
    await loadDataWithState(() => getProducts({ 
        category: 'electronics', 
        minPrice: 1000 
    }), productsState);
    console.log('Состояние товаров:', productsState.getState());
    
    console.log('Создаем заказ...');
    const orderResponse = await createOrder({
        userId: 1,
        items: [
            { productId: 101, quantity: 1, price: 1500 },
            { productId: 102, quantity: 2, price: 800 }
        ],
        totalAmount: 3100
    });
    
    handleApiResponse(
        orderResponse,
        (order) => console.log('Заказ создан:', order),
        (error) => console.error('Ошибка создания заказа:', error)
    );
}

// Раскомментируйте для тестирования (не будет работать без реального API)
    exampleUsage();