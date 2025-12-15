export interface MapConfig {
    provider: 'kakao' | 'naver';
    enabled: boolean; // 지도 활성화 여부
    coords: [number, number] | null; // [latitude, longitude]
    client_id: string | null; // 암호화된 client_id (카카오맵: REST API 키, 네이버맵: NCP Client ID)
    client_secret: string | null; // 암호화된 client_secret (네이버맵만 사용)
}

export interface SiteSetting {
    id: string;
    contact: {
        email: string | null;
        address: string | null;
        business_hours: string | null;
        phone_primary: string | null;
        phone_secondary: string | null;
        fax: string | null;
        // map_url: string | null; // deprecated: 하위 호환성을 위해 유지
        maps: MapConfig[] | null; // 새로운 지도 설정 배열
        extra_json: any | null;
    };
    default_boards: {
        [key: string]: {
            id: string | null;
            name: string | null;
            display_order: number | null;
        } | null;
    } | null;
    // 예시,
    // {
    //     "pds": {
    //       "id": null,
    //       "name": "자료실",
    //       "display_order": 2
    //     },
    //     "quote": {
    //       "id": "870c78da-fb12-48a8-948b-89d7d50db031",
    //       "name": "견적문의",
    //       "display_order": 4
    //     },
    //     "notice": {
    //       "id": "dff9a65b-5b2e-41f4-a3da-bf77536be08d",
    //       "name": "공지사항",
    //       "display_order": 0
    //     },
    //     "review": {
    //       "id": "a3b1a215-9bcc-4ae8-813f-86d05899d9b6",
    //       "name": "고객후기",
    //       "display_order": 3
    //     },
    //     "inquiry": {
    //       "id": "f4c0e3ec-6ae8-4c14-9288-29a1667b9373",
    //       "name": "Q&A",
    //       "display_order": 1
    //     }
    //   }
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
}