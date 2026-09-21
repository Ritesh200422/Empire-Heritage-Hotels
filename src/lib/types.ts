/** Shared types for API request/response contracts */

export type ChatResponseType =
  | 'answer'
  | 'availability_request'
  | 'availability_result'
  | 'fallback'
  | 'error';

export type MissingField = 'checkIn' | 'checkOut' | 'adults';

/** Source label for trust panel */
export interface SourceLabel {
  id: string;
  label: string;
}

/** Alternative suggestion when rooms are sold out */
export interface Alternative {
  type: 'other_room' | 'shifted_dates' | 'shorter_stay';
  checkIn: string;
  checkOut: string;
  adults: number;
  roomTypeId: string;
  roomName: string;
  nights: number;
  pricePerNight: number;
  totalPrice: number;
  unitsLeft: number;
  description: string;
}

export interface AvailabilityOption {
  roomTypeId: string;
  name: string;
  unitsLeft: number;
  pricePerNight: number;
  totalPrice: number;
  nights: number;
}

export interface AvailabilityResult {
  checkIn: string;
  checkOut: string;
  adults: number;
  options: AvailabilityOption[];
}

export interface ChatResponse {
  type: ChatResponseType;
  mode: 'ai' | 'degraded' | 'fallback';
  message: string;
  sources?: SourceLabel[];
  missingFields?: MissingField[];
  availability?: AvailabilityResult;
  alternatives?: Alternative[];
  requestId: string;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  availabilityForm?: {
    checkIn: string;
    checkOut: string;
    adults: number;
  };
}

/** Gemini structured output schema */
export interface GeminiAnswer {
  answer: string;
  usedSourceIds: string[];
  confident: boolean;
}

/** Tool call types */
export interface CheckAvailabilityArgs {
  checkIn: string;
  checkOut: string;
  adults: number;
}

export interface FindRoomsForGuestsArgs {
  adults: number;
}
