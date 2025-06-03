const testProduct = {
    title: "QUEFE 96 Colors 3000pcs Pony Beads Bracelet Making Kit Friendship Bracelet Kit Rainbow Kandi Beads with Letter and Heart Beads Elastic Threads for Jewelry Necklace Making",
    description: "This comprehensive bracelet making kit includes 3000 pony beads in 96 vibrant colors, perfect for creating beautiful friendship bracelets, jewelry, and necklaces.",
    keywords: ["bracelet", "beads", "jewelry", "crafts"],
    category: "Arts & Crafts",
    targetMarket: "us",
    price: 19.99,
    rating: 4.5
};

async function testOptimizeAPI() {
    try {
        console.log('Testing AI optimization API...');

        const response = await fetch('http://localhost:3000/api/optimize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productInfo: testProduct,
                stream: false // 使用非流式响应以便测试
            }),
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            return;
        }

        const result = await response.json();
        console.log('API Response:', JSON.stringify(result, null, 2));

        if (result.success && result.data) {
            console.log('\n✅ AI API工作正常!');
            console.log('优化后标题:', result.data.title.optimized);
        } else {
            console.log('\n❌ AI API返回格式错误');
        }

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

testOptimizeAPI();