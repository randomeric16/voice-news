const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials missing. Database operations will fail.');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

async function saveClusters(clusters) {
    if (!clusters || clusters.length === 0) return;

    console.log(`Saving ${clusters.length} clusters to Supabase...`);
    
    const rows = clusters.map(c => ({
        cluster_title: c.clusterTitle,
        summary: c.summary,
        images: c.items.map(i => i.image).filter(img => img),
        sources: [...new Set(c.items.map(i => i.source))],
        priority: c.priority,
        created_at: new Date().toISOString()
    }));

    try {
        const { error } = await supabase
            .from('news_clusters')
            .upsert(rows, { onConflict: 'cluster_title' });

        if (error) throw error;
        console.log('Clusters saved successfully.');
    } catch (error) {
        console.error('Error saving to Supabase:', error.message);
    }
}

module.exports = { saveClusters };
