import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Initialized server-side Gemini client with User-Agent as required by skill guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Storage file for persistent Admin Dominance state
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'admin_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial state
interface CustomField {
  id: string;
  title: string;
  category: 'natural' | 'human' | 'satellite' | 'general';
  fieldType: 'stats' | 'text' | 'alert' | 'link';
  value: string;
  source: string;
  createdAt: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'مدير أعلى (سوبر أدمن)' | 'محلل جيومكاني' | 'باحث استشعار عن بعد' | 'مستخدم معتمد';
  status: 'نشط' | 'مجمد';
  joinedDate: string;
}

interface PlatformState {
  userCount: number;
  users: AdminUser[];
  customFields: CustomField[];
  systemNotice: string;
  lastUpdated: string;
}

const defaultState: PlatformState = {
  userCount: 18450,
  users: [
    {
      id: 'usr-1',
      name: 'سعادة المهندس المشرف العام',
      email: 'admin.gis@oman-spatial.gov.om',
      role: 'مدير أعلى (سوبر أدمن)',
      status: 'نشط',
      joinedDate: '2024-01-15',
    },
    {
      id: 'usr-2',
      name: 'د. خالد المعمري',
      email: 'khalid.m@oman-spatial.gov.om',
      role: 'محلل جيومكاني',
      status: 'نشط',
      joinedDate: '2024-03-10',
    },
    {
      id: 'usr-3',
      name: 'م. مريم الحارثية',
      email: 'maryam.h@oman-spatial.gov.om',
      role: 'باحث استشعار عن بعد',
      status: 'نشط',
      joinedDate: '2024-05-22',
    },
    {
      id: 'usr-4',
      name: 'أحمد البلوشي',
      email: 'ahmed.b@oman-spatial.gov.om',
      role: 'مستخدم معتمد',
      status: 'نشط',
      joinedDate: '2024-08-01',
    },
  ],
  customFields: [
    {
      id: 'field-1',
      title: 'مؤشر أمان السواحل ومراقبة حركة بحر العرب',
      category: 'natural',
      fieldType: 'alert',
      value: 'الحالة مستقرة، لا توجد مؤشرات لنشاط مداري أو تشكل منخفضات جوية في بحر العرب وخليج عمان خلال الـ 72 ساعة القادمة.',
      source: 'هيئة الطيران المدني - المركز الوطني للإنذار المبكر من المخاطر المتعددة',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'field-2',
      title: 'إجمالي استثمارات الطاقة المتجددة والهيدروجين في الدقم',
      category: 'human',
      fieldType: 'stats',
      value: '38 مليار دولار أمريكي (وفق اتفاقيات هيدروم عمان وتطوير الموانئ الخضراء)',
      source: 'الهيئة العامة للمناطق الاقتصادية الخاصة والمناطق الحرة (أوباز)',
      createdAt: new Date().toISOString(),
    },
  ],
  systemNotice: 'المنصة الوطنية لرصد وتحليل الظواهر الجغرافية لسلطنة عُمان تعمل بكامل جاهزيتها وفق معايير الدقة الموثقة.',
  lastUpdated: new Date().toISOString(),
};

function loadState(): PlatformState {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading store file, fallback to default:', err);
  }
  return { ...defaultState };
}

function saveState(state: PlatformState) {
  try {
    state.lastUpdated = new Date().toISOString();
    fs.writeFileSync(STORE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store file:', err);
  }
}

// ---------------- API ROUTES ----------------

// Get current platform state (accessible by frontend & admin)
app.get('/api/admin/state', (req: Request, res: Response) => {
  const state = loadState();
  res.json({ success: true, data: state });
});

// Update user count (Admin Dominance)
app.post('/api/admin/user-count', (req: Request, res: Response) => {
  const { userCount } = req.body;
  if (typeof userCount !== 'number' || userCount < 0) {
    return res.status(400).json({ error: 'القيمة المدخلة لعدد المستخدمين غير صالحة' });
  }
  const state = loadState();
  state.userCount = userCount;
  saveState(state);
  res.json({ success: true, message: 'تم تحديث عدد المستخدمين بنجاح', userCount: state.userCount });
});

// Manage users (Add, edit, delete, toggle)
app.post('/api/admin/users', (req: Request, res: Response) => {
  const { action, user, userId } = req.body;
  const state = loadState();

  if (action === 'add' && user) {
    const newUser: AdminUser = {
      id: 'usr-' + Date.now(),
      name: user.name || 'مستخدم جديد',
      email: user.email || 'user@oman-spatial.gov.om',
      role: user.role || 'مستخدم معتمد',
      status: user.status || 'نشط',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    state.users.unshift(newUser);
    state.userCount += 1;
    saveState(state);
    return res.json({ success: true, message: 'تمت إضافة المستخدم بنجاح', users: state.users, userCount: state.userCount });
  }

  if (action === 'delete' && userId) {
    state.users = state.users.filter((u) => u.id !== userId);
    state.userCount = Math.max(0, state.userCount - 1);
    saveState(state);
    return res.json({ success: true, message: 'تم حذف المستخدم بنجاح', users: state.users, userCount: state.userCount });
  }

  if (action === 'update' && user && user.id) {
    state.users = state.users.map((u) => (u.id === user.id ? { ...u, ...user } : u));
    saveState(state);
    return res.json({ success: true, message: 'تم تحديث بيانات المستخدم بنجاح', users: state.users });
  }

  res.status(400).json({ error: 'إجراء غير معروف' });
});

// Custom fields / خانات (Add, edit, delete)
app.post('/api/admin/custom-fields', (req: Request, res: Response) => {
  const { action, field, fieldId } = req.body;
  const state = loadState();

  if (action === 'add' && field) {
    const newField: CustomField = {
      id: 'field-' + Date.now(),
      title: field.title || 'خانة مخصصة جديدة',
      category: field.category || 'general',
      fieldType: field.fieldType || 'text',
      value: field.value || '',
      source: field.source || 'المرصد الجغرافي العماني',
      createdAt: new Date().toISOString(),
    };
    state.customFields.unshift(newField);
    saveState(state);
    return res.json({ success: true, message: 'تمت إضافة الخانة المخصصة بنجاح', fields: state.customFields });
  }

  if (action === 'delete' && fieldId) {
    state.customFields = state.customFields.filter((f) => f.id !== fieldId);
    saveState(state);
    return res.json({ success: true, message: 'تم حذف الخانة بنجاح', fields: state.customFields });
  }

  if (action === 'update' && field && field.id) {
    state.customFields = state.customFields.map((f) => (f.id === field.id ? { ...f, ...field } : f));
    saveState(state);
    return res.json({ success: true, message: 'تم تعديل الخانة بنجاح', fields: state.customFields });
  }

  res.status(400).json({ error: 'إجراء غير معروف' });
});

// Reset platform to verified baseline
app.post('/api/admin/reset', (req: Request, res: Response) => {
  saveState({ ...defaultState, lastUpdated: new Date().toISOString() });
  res.json({ success: true, message: 'تمت استعادة الإعدادات الأصلية المعتمدة للمنصة بنجاح' });
});

// Verified Multi-source AI Chat & Fact-Checking Endpoint using Gemini 3.8 Flash with Google Search Grounding
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'يرجى إدخال السؤال أو الاستفسار' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'مفتاح واجهة برمجة التطبيقات GEMINI_API_KEY غير مهيأ في إعدادات البيئة',
      });
    }

    const systemInstruction = `أنت ذكاء اصطناعي فائق الدقة، موسوعي وموثق بالكامل، شبيه بـ ChatGPT مع ميزة التوثيق الدقيق للمصادر وجمع كميات ضخمة من البيانات من مصادر متعددة موثوقة.
قواعدك الصارمة:
1. دقق في الأسئلة وأجب دائماً بالمعلومة الصحيحة والمؤكدة 100%. لا تقل "لا أعلم" أو "ما أعرف" أبداً، بل ابحث واجمع البيانات من مصادر متعددة وحللها وقدم الإجابة الشافية.
2. عند السؤال عن "خريطة عُمان" أو "إنشاء صورة لخريطة عمان" أو جغرافية سلطنة عُمان:
   - قدم تفصيلاً جغرافياً دقيقاً ومؤكداً للمحافظات الـ 11 (مسقط، ظفار، مسندم، الداخلية، شمال الباطنة، جنوب الباطنة، البريمي، الظاهرة، شمال الشرقية، جنوب الشرقية، الوسطى)، رأس مسندم ومضيق هرمز، وجيب مدحاء، وجزيرة مصيرة، وجزر الحلانيات، والحدود مع الإمارات والسعودية واليمن.
3. سرعة تحديد الظواهر الطبيعية والبشرية:
   - الظواهر الطبيعية: التضاريس، جبل شمس (3,009م)، أودية عمان، أفيوليت سمائل، رمال الشرقية والربع الخالي، أعاصير بحر العرب (جونو، شاهين، ميكونو)، وظاهرة خريف ظفار السنوية.
   - الظواهر البشرية: التوزيع السكاني، موانئ الدقم وصلالة وصحار، الأفلاج الخمسة المسجلة باليونسكو، مشاريع رؤية عمان 2040، الطاقة المتجددة والهيدروجين الأخضر.
4. تحسين الصور الجوية والفضائية: تقديم تحليل مفصل للأطياف (NDVI، الحراري، التباين، الدقة الفضائية، وأجهزة الاستشعار كـ Sentinel و Landsat).
5. في نهاية كل إجابة، اذكر دائماً المصادر والمراجع المعتمدة التي تم الاستناد إليها بشكل واضح وصريح.
6. اكتب بلغة عربية فصيحة، واضحة، مرتبة بالنقاط والعناوين وموثقة.`;

    // Check if the user is asking for a map of Oman
    const isMapRequest = /خريطة|خريطه|صورة لخريطة|رسم خريطة|map of oman|map/i.test(message);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const responseText = response.text || 'تم استرجاع التحليل بنجاح وفق المصادر المعتمدة.';

    // Extract search grounding metadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = groundingChunks
      .filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        title: chunk.web?.title || 'مصدر معتمد',
        uri: chunk.web?.uri,
      }));

    res.json({
      success: true,
      answer: responseText,
      sources: webSources,
      isMapRequest,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'تعذر معالجة الاستفسار: ' + (error.message || 'خطأ في الاتصال'),
    });
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Oman GeoIntelligence Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
