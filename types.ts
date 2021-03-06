"use strict";

export type GetUrlResponse = {
    statusCode: number,
    statusMessage: string;
    headers: { [ key: string] : string };
    body: Uint8Array;
};

export type Options = {
    method?: string,
    body?: Uint8Array
    headers?: { [ key: string] : string },
};