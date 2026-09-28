const supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const auth = {
  async loginWithGoogle() {
    await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  },

  async logout() {
    await supabaseClient.auth.signOut();
    window.location.reload();
  },

  onStateChange(callback) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
};

const db = {
  async getConversations() {
    const { data, error } = await supabaseClient
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createConversation(userId, title = "Nova Produção") {
    const { data, error } = await supabaseClient
      .from('conversations')
      .insert([{ user_id: userId, title }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateConversationTitle(id, title) {
    await supabaseClient.from('conversations').update({ title }).eq('id', id);
  },

  async getMessages(conversationId) {
    const { data, error } = await supabaseClient
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async saveMessage(conversationId, role, content) {
    await supabaseClient.from('messages').insert([{
      conversation_id: conversationId,
      role,
      content
    }]);
  }
};
