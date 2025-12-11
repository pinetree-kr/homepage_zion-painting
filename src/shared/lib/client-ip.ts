"use server"

import { headers } from "next/headers";

/**
 * 클라이언트 IP 주소 가져오기
 */
export async function getClientIp(): Promise<string | null> {
    try {
        const headersList = await headers();
        const forwardedFor = headersList.get('x-forwarded-for');
        const realIp = headersList.get('x-real-ip');
        const cfConnectingIp = headersList.get('cf-connecting-ip'); // Cloudflare

        console.log(forwardedFor, realIp, cfConnectingIp);

        if (forwardedFor) {
            // x-forwarded-for는 여러 IP가 쉼표로 구분될 수 있음
            return forwardedFor.split(',')[0].trim();
        }
        if (realIp) {
            return realIp;
        }
        if (cfConnectingIp) {
            return cfConnectingIp;
        }
        return null;
    } catch (error) {
        console.error('IP 주소 가져오기 실패:', error);
        return null;
    }
}
