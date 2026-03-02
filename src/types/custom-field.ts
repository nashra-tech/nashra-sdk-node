export interface CustomField {
  uuid: string;
  field_name: string;
  data_name: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  is_required: boolean;
}

export interface CreateCustomFieldParams {
  field_name: string;
  data_name: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  is_required?: boolean;
}

export interface UpdateCustomFieldParams {
  field_name?: string;
  data_name?: string;
  type?: 'text' | 'number' | 'date' | 'boolean';
  is_required?: boolean;
}

export interface ListCustomFieldsParams {
  per_page?: number;
  page?: number;
}
