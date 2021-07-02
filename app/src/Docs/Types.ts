export type Category = {
  name: string;
  sections: Section[];
};

export type Section = APISection | DomainSection;

export type APISection = {
  type: "api";
  name: string;
  description: string;
  endpoints: Endpoint[];
  models: Model[];
  methods: Method[];
};

export type DomainSection = {
  type: "domain";
  name: string;
  description: string;
};

export type Endpoint = {
  method: "POST" | "GET" | "PUT" | "DELETE";
  endpoint: string;
};

export type Model = {
  name: string;
  attributes: Attribute[];
  sample: Record<string, any>;
};

export type Attribute = {
  name: string;
  type: "string" | "number" | "object";
  description: string;
  children?: Attribute[];
};

export type Method = {
  title: string;
  description: string;
  parameters: Parameter[];
  request: Record<string, any>;
  response: Record<string, any>;
};

export type Parameter = {
  name: string;
  tags: Tag[];
  description: string;
};

export type Tag = {
  value: string;
  color: string;
};
