"use server"

import { createServerClient } from '@/src/shared/lib/supabase/server';
import type { CompanyInfo } from './types';

export async function upsertCompanyInfo(companyInfo: Partial<Omit<CompanyInfo, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    try {
        const supabase = await createServerClient();

        const { data: existingInfo, error: existingInfoError } = await supabase.from('pages').select('id').eq('code', 'company_intro').eq('status', 'published').limit(1).maybeSingle() as { data: { id: string } | null; error: any };

        if (existingInfoError) {
            console.error('회사 정보 조회 오류:', existingInfoError);
            throw existingInfoError;
        }

        const updateBody = {
            introduction: companyInfo.introduction ?? undefined,
            vision: companyInfo.vision ?? undefined,
            greetings: companyInfo.greetings ?? undefined,
            mission: companyInfo.mission ?? undefined,
            strengths: companyInfo.strengths?.map(strength => ({
                id: strength.id ?? `temp-${Date.now()}-${Math.random()}`,
                icon: strength.icon,
                title: strength.title,
                description: strength.description,
            })) ?? undefined,
            values: companyInfo.values?.map(value => ({
                id: value.id ?? `temp-${Date.now()}-${Math.random()}`,
                title: value.title,
                description: value.description,
            })) ?? undefined,
            histories: companyInfo.histories?.map(history => ({
                id: history.id ?? `temp-${Date.now()}-${Math.random()}`,
                year: history.year,
                month: history.month,
                content: history.content,
                type: history.type,
                display_order: history.display_order,
            })) ?? undefined,
            organization_members: companyInfo.organization_members?.map(member => ({
                id: member.id ?? `temp-${Date.now()}-${Math.random()}`,
                name: member.name,
                title: member.title,
                image_url: member.image_url ?? null,
                display_order: member.display_order ?? 0,
            })) ?? undefined,
        };

        // new Record
        if (!existingInfo) {
            const { error: newInfoError } = await supabase.from('pages')
                .insert({
                    code: 'company_intro',
                    page: 'about',
                    section_type: 'rich_text',
                    display_order: 0,
                    status: 'published',
                    metadata: updateBody,
                })
                ;

            if (newInfoError) {
                console.error('회사 정보 생성 오류:', newInfoError);
                throw newInfoError;
            }

            return true;
        } else {
            const { error: updatedInfoError } = await supabase.from('pages')
                .update({
                    metadata: updateBody,
                })
                .eq('code', 'company_intro')
                .eq('status', 'published')
                ;

            if (updatedInfoError) {
                console.error('회사 정보 업데이트 오류:', updatedInfoError);
                throw updatedInfoError;
            }

            return true;
        }
    } catch (error) {
        console.error('회사 정보 업데이트 오류:', error);
        throw error;
    }
}