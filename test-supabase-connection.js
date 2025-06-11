// Supabase 연결 테스트 스크립트
// Node.js에서 실행하여 데이터베이스 상태 확인

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwjbtsjeikrwyqltkpqv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53amJ0c2plaWtyd3lxbHRrcHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDA0MDUsImV4cCI6MjA2NTExNjQwNX0.UXNFgCrKfBHrcbenw94v9rD-sbGEE6ENDaF7h01EFPQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('🔄 Supabase 연결 테스트 시작...');
    
    try {
        // 1. 기본 연결 테스트
        const { data: healthCheck, error: healthError } = await supabase
            .from('sites')
            .select('count')
            .limit(1);
            
        if (healthError) {
            console.log('❌ 연결 실패:', healthError.message);
            return;
        }
        
        console.log('✅ Supabase 연결 성공!');
        
        // 2. 테이블 존재 확인
        const tables = ['sites', 'comments', 'comment_likes', 'spam_reports', 'site_moderators'];
        
        for (const table of tables) {
            try {
                const { data, error } = await supabase.from(table).select('*').limit(1);
                if (error) {
                    console.log(`❌ 테이블 ${table}: ${error.message}`);
                } else {
                    console.log(`✅ 테이블 ${table}: 확인 완료`);
                }
            } catch (err) {
                console.log(`❌ 테이블 ${table}: ${err.message}`);
            }
        }
        
        // 3. 테스트 데이터 생성
        console.log('\n🔄 테스트 데이터 생성 중...');
        
        // 테스트 사이트 생성
        const { data: siteData, error: siteError } = await supabase
            .from('sites')
            .insert({
                name: 'Kommentio 테스트 사이트',
                domain: 'localhost:5173',
                description: 'v0.2.1 Supabase 실제 연동 테스트',
                settings: {
                    allow_anonymous: true,
                    moderation_enabled: false,
                    max_comment_length: 2000,
                    theme: 'light',
                    language: 'ko'
                }
            })
            .select()
            .single();
            
        if (siteError) {
            console.log('❌ 사이트 생성 실패:', siteError.message);
        } else {
            console.log('✅ 테스트 사이트 생성 성공!');
            console.log('📄 사이트 ID:', siteData.id);
            
            // 테스트 댓글 생성
            const { data: commentData, error: commentError } = await supabase
                .from('comments')
                .insert({
                    site_id: siteData.id,
                    page_url: 'https://kommentio.com/test-page',
                    content: '🚀 Supabase 실제 연동 테스트 댓글입니다!',
                    author_name: 'Kommentio 테스터',
                    author_email: 'test@kommentio.com',
                    depth: 0
                })
                .select()
                .single();
                
            if (commentError) {
                console.log('❌ 댓글 생성 실패:', commentError.message);
            } else {
                console.log('✅ 테스트 댓글 생성 성공!');
                console.log('💬 댓글 ID:', commentData.id);
            }
        }
        
        // 4. 데이터 조회 테스트
        console.log('\n🔄 데이터 조회 테스트...');
        
        const { data: allComments, error: readError } = await supabase
            .from('comments')
            .select(`
                *,
                sites!inner(name, domain)
            `)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });
            
        if (readError) {
            console.log('❌ 댓글 조회 실패:', readError.message);
        } else {
            console.log(`✅ 댓글 조회 성공! 총 ${allComments.length}개 댓글`);
            allComments.forEach((comment, index) => {
                console.log(`📝 댓글 ${index + 1}: "${comment.content}" - ${comment.author_name}`);
            });
        }
        
        console.log('\n🎉 Supabase 연동 테스트 완료!');
        
    } catch (error) {
        console.log('❌ 전체 테스트 실패:', error.message);
    }
}

// 테스트 실행
testConnection();