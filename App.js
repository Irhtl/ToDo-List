import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Modal,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Custom Date Picker
const CustomDatePicker = ({ visible, onClose, onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const handleConfirm = () => {
    onDateSelect(selectedDate);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>انتخاب تاریخ</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.dateDisplay}>
            <Text style={styles.dateText}>
              {selectedDate.toLocaleDateString('fa-IR')}
            </Text>
          </View>
          
          <View style={styles.pickerButtons}>
            <TouchableOpacity 
              style={[styles.pickerButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>لغو</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.pickerButton, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>تأیید</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Custom Time Picker
const CustomTimePicker = ({ visible, onClose, onTimeSelect }) => {
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [isPM, setIsPM] = useState(false);

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const handleConfirm = () => {
    const hour24 = isPM ? (parseInt(hour) + 12) : parseInt(hour);
    const timeString = `${hour24.toString().padStart(2, '0')}:${minute}`;
    onTimeSelect(timeString);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>انتخاب زمان</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.timePickerContent}>
            <ScrollView style={styles.timeScroll}>
              <Text style={styles.timeLabel}>ساعت:</Text>
              {hours.map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[
                    styles.timeOption,
                    hour === h && styles.selectedTimeOption
                  ]}
                  onPress={() => setHour(h)}
                >
                  <Text style={[
                    styles.timeOptionText,
                    hour === h && styles.selectedTimeOptionText
                  ]}>
                    {h}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <ScrollView style={styles.timeScroll}>
              <Text style={styles.timeLabel}>دقیقه:</Text>
              {minutes.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.timeOption,
                    minute === m && styles.selectedTimeOption
                  ]}
                  onPress={() => setMinute(m)}
                >
                  <Text style={[
                    styles.timeOptionText,
                    minute === m && styles.selectedTimeOptionText
                  ]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.ampmContainer}>
              <TouchableOpacity
                style={[
                  styles.ampmButton,
                  !isPM && styles.selectedAmpm
                ]}
                onPress={() => setIsPM(false)}
              >
                <Text style={[
                  styles.ampmText,
                  !isPM && styles.selectedAmpmText
                ]}>
                  ق.ظ
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.ampmButton,
                  isPM && styles.selectedAmpm
                ]}
                onPress={() => setIsPM(true)}
              >
                <Text style={[
                  styles.ampmText,
                  isPM && styles.selectedAmpmText
                ]}>
                  ب.ظ
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.pickerButtons}>
            <TouchableOpacity 
              style={[styles.pickerButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>لغو</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.pickerButton, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>تأیید</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Slide Menu Component
const SlideMenu = ({ visible, onClose, user, onLogin, onLogout, onSignup, darkMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const colors = darkMode ? COLORS.dark : COLORS.light;
  const slideAnim = React.useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('خطا', 'لطفا ایمیل و رمز عبور را وارد کنید');
      return;
    }

    if (!isLogin && !name) {
      Alert.alert('خطا', 'لطفا نام خود را وارد کنید');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('خطا', 'رمز عبور و تأیید آن مطابقت ندارند');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('خطا', 'لطفا یک ایمیل معتبر وارد کنید');
      return;
    }

    if (password.length < 6) {
      Alert.alert('خطا', 'رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }

    setLoading(true);

    try {
      // شبیه‌سازی درخواست API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isLogin) {
        // لاگین
        const user = await AsyncStorage.getItem(`user_${email}`);
        if (!user) {
          Alert.alert('خطا', 'کاربری با این ایمیل وجود ندارد');
          setLoading(false);
          return;
        }
        
        const userData = JSON.parse(user);
        if (userData.password !== password) {
          Alert.alert('خطا', 'رمز عبور اشتباه است');
          setLoading(false);
          return;
        }
        
        await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
        onLogin(userData);
        onClose();
        resetForm();
      } else {
        // ثبت‌نام
        const existingUser = await AsyncStorage.getItem(`user_${email}`);
        if (existingUser) {
          Alert.alert('خطا', 'این ایمیل قبلاً ثبت شده است');
          setLoading(false);
          return;
        }
        
        const userData = {
          id: Date.now().toString(),
          email,
          password,
          name,
          createdAt: new Date().toISOString(),
          tasks: []
        };
        
        await AsyncStorage.setItem(`user_${email}`, JSON.stringify(userData));
        await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
        onSignup(userData);
        onClose();
        resetForm();
      }
    } catch (error) {
      Alert.alert('خطا', 'مشکلی در ارتباط با سرور پیش آمده');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setIsLogin(true);
  };

  const handleLogout = () => {
    Alert.alert(
      'خروج از حساب',
      'آیا مطمئنید که می‌خواهید خارج شوید؟',
      [
        { text: 'لغو', style: 'cancel' },
        { 
          text: 'خروج', 
          style: 'destructive',
          onPress: async () => {
            await onLogout();
            onClose();
          }
        }
      ]
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.menuOverlay}>
      <TouchableOpacity 
        style={styles.menuBackdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View 
        style={[
          styles.menuContainer,
          { 
            backgroundColor: colors.card,
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        {user ? (
          <>
            <View style={styles.userInfo}>
              <Icon name="account-circle" size={80} color={colors.primary} />
              <Text style={[styles.userName, { color: colors.text }]}>
                {user.name}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                {user.email}
              </Text>
              <Text style={[styles.userStats, { color: colors.textSecondary }]}>
                {user.tasks?.length || 0} کار ثبت شده
              </Text>
            </View>

            <View style={styles.menuItems}>
              <TouchableOpacity style={styles.menuItem}>
                <Icon name="cog" size={24} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  تنظیمات
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Icon name="bell" size={24} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  اعلان‌ها
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Icon name="help-circle" size={24} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  راهنما
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Icon name="information" size={24} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  درباره ما
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.logoutButton, { backgroundColor: colors.danger + '20' }]}
              onPress={handleLogout}
            >
              <Icon name="logout" size={24} color={colors.danger} />
              <Text style={[styles.logoutText, { color: colors.danger }]}>
                خروج از حساب
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <ScrollView style={styles.authMenu}>
            <View style={styles.menuHeader}>
              <Icon name="account-circle" size={60} color={colors.primary} />
              <Text style={[styles.menuTitle, { color: colors.text }]}>
                {isLogin ? 'ورود به حساب' : 'ایجاد حساب'}
              </Text>
            </View>

            {!isLogin && (
              <View style={styles.inputContainer}>
                <Icon name="account" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.menuInput, { 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border
                  }]}
                  placeholder="نام و نام خانوادگی"
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Icon name="email" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.menuInput, { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border
                }]}
                placeholder="ایمیل"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.menuInput, { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border
                }]}
                placeholder="رمز عبور"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {!isLogin && (
              <View style={styles.inputContainer}>
                <Icon name="lock-check" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.menuInput, { 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border
                  }]}
                  placeholder="تکرار رمز عبور"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            )}

            <TouchableOpacity 
              style={[styles.menuAuthButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.menuAuthButtonText}>
                  {isLogin ? 'ورود' : 'ثبت‌نام'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.switchAuthButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={[styles.switchAuthText, { color: colors.primary }]}>
                {isLogin 
                  ? 'حساب کاربری ندارید؟ ثبت‌نام کنید' 
                  : 'قبلاً ثبت‌نام کرده‌اید؟ وارد شوید'}
              </Text>
            </TouchableOpacity>

            <View style={[styles.authInfo, { backgroundColor: colors.background }]}>
              <Text style={[styles.authInfoText, { color: colors.textSecondary }]}>
                • رمز عبور باید حداقل ۶ کاراکتر باشد
              </Text>
              <Text style={[styles.authInfoText, { color: colors.textSecondary }]}>
                • از ایمیل معتبر استفاده کنید
              </Text>
              {isLogin && (
                <Text style={[styles.authInfoText, { color: colors.textSecondary }]}>
                  • برای تست: test@test.com / 123456
                </Text>
              )}
            </View>
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
};

const COLORS = {
  light: {
    background: '#F5F7FA',
    card: '#FFFFFF',
    text: '#2D3748',
    textSecondary: '#718096',
    border: '#E2E8F0',
    primary: '#4F46E5',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899',
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    orange: '#F97316',
  },
  dark: {
    background: '#1A202C',
    card: '#2D3748',
    text: '#F7FAFC',
    textSecondary: '#CBD5E0',
    border: '#4A5568',
    primary: '#6366F1',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    purple: '#A78BFA',
    pink: '#F472B6',
    blue: '#60A5FA',
    green: '#34D399',
    yellow: '#FBBF24',
    orange: '#FB923C',
  }
};

// Main App Component
export default function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskCategory, setTaskCategory] = useState('کار');
  const [priority, setPriority] = useState('متوسط');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [filter, setFilter] = useState('همه');
  const [darkMode, setDarkMode] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  const colors = darkMode ? COLORS.dark : COLORS.light;

  // Load user and tasks on app start
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        loadUserTasks(parsedUser.email);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserTasks = async (email) => {
    try {
      const userData = await AsyncStorage.getItem(`user_${email}`);
      if (userData) {
        const parsedData = JSON.parse(userData);
        setTasks(parsedData.tasks || []);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const saveUserTasks = async (tasksArray) => {
    if (!user) return;
    
    try {
      const userData = await AsyncStorage.getItem(`user_${user.email}`);
      if (userData) {
        const parsedData = JSON.parse(userData);
        parsedData.tasks = tasksArray;
        await AsyncStorage.setItem(`user_${user.email}`, JSON.stringify(parsedData));
        
        // Update current user data
        const updatedUser = { ...user, tasks: tasksArray };
        await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setTasks(userData.tasks || []);
    Alert.alert('موفقیت', `خوش آمدید ${userData.name}!`);
  };

  const handleSignup = (userData) => {
    setUser(userData);
    setTasks([]);
    Alert.alert('موفقیت', 'حساب کاربری با موفقیت ایجاد شد!');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('currentUser');
    setUser(null);
    setTasks([]);
    setShowMenu(false);
  };

  const handleDateSelect = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setDueDate(formattedDate);
  };

  const handleTimeSelect = (time) => {
    setDueTime(time);
  };

  const addTask = async () => {
    if (newTask.trim() === '') {
      Alert.alert('خطا', 'لطفا عنوان کار را وارد کنید');
      return;
    }

    const newTaskObj = {
      id: Date.now().toString(),
      title: newTask.trim(),
      description: taskDescription.trim(),
      category: taskCategory,
      priority: priority,
      isCompleted: false,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      dueTime: dueTime || '12:00',
      createdAt: new Date().toISOString(),
      userId: user ? user.id : 'guest',
    };

    const updatedTasks = [newTaskObj, ...tasks];
    setTasks(updatedTasks);
    
    if (user) {
      await saveUserTasks(updatedTasks);
    }
    
    setNewTask('');
    setTaskDescription('');
    setTaskCategory('کار');
    setPriority('متوسط');
    setDueDate('');
    setDueTime('');
    
    Alert.alert('موفقیت', 'کار جدید با موفقیت اضافه شد!', [{ text: 'باشه' }]);
  };

  const getCategoryColor = (category) => {
    const categoryColors = {
      'کار': colors.purple,
      'شخصی': colors.pink,
      'خرید': colors.blue,
      'سلامتی': colors.green,
      'آموزش': colors.yellow,
      'پروژه': colors.orange,
    };
    return categoryColors[category] || colors.primary;
  };

  const toggleTaskCompletion = async (id) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    );
    setTasks(updatedTasks);
    
    if (user) {
      await saveUserTasks(updatedTasks);
    }
  };

  const deleteTask = async (id) => {
    Alert.alert(
      'حذف کار',
      'آیا مطمئنید که می‌خواهید این کار را حذف کنید؟',
      [
        { text: 'لغو', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: async () => {
            const updatedTasks = tasks.filter(task => task.id !== id);
            setTasks(updatedTasks);
            
            if (user) {
              await saveUserTasks(updatedTasks);
            }
          }
        }
      ]
    );
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'فعال':
        return !task.isCompleted;
      case 'تکمیل‌شده':
        return task.isCompleted;
      case 'امروز':
        const today = new Date().toISOString().split('T')[0];
        return task.dueDate === today;
      default:
        return true;
    }
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.isCompleted).length,
    active: tasks.filter(t => !t.isCompleted).length,
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'کار': 'briefcase-outline',
      'شخصی': 'account-outline',
      'خرید': 'cart-outline',
      'سلامتی': 'heart-outline',
      'آموزش': 'school-outline',
      'پروژه': 'clipboard-check-outline',
    };
    return icons[category] || 'checkbox-marked-circle-outline';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
  };

  const TaskItem = ({ item }) => {
    const categoryColor = getCategoryColor(item.category);

    return (
      <View style={[styles.taskItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity 
          style={[
            styles.checkbox,
            { borderColor: item.isCompleted ? colors.success : categoryColor }
          ]}
          onPress={() => toggleTaskCompletion(item.id)}
        >
          <Icon 
            name={item.isCompleted ? "check-circle" : "checkbox-blank-circle-outline"} 
            size={24} 
            color={item.isCompleted ? colors.success : categoryColor} 
          />
        </TouchableOpacity>

        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            <Text style={[
              styles.taskTitle,
              { color: colors.text },
              item.isCompleted && styles.completedText
            ]}>
              {item.title}
            </Text>
            
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
              <Icon 
                name={getCategoryIcon(item.category)} 
                size={14} 
                color={categoryColor} 
              />
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {item.category}
              </Text>
            </View>
          </View>

          {item.description ? (
            <Text style={[styles.taskDescription, { color: colors.textSecondary }]}>
              {item.description}
            </Text>
          ) : null}

          <View style={styles.taskFooter}>
            <View style={styles.taskMeta}>
              <View style={[
                styles.priorityDot,
                { 
                  backgroundColor: 
                    item.priority === 'بالا' ? colors.danger :
                    item.priority === 'متوسط' ? colors.warning :
                    colors.success
                }
              ]} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {item.priority}
              </Text>
              
              <Icon name="calendar" size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {formatDate(item.dueDate)}
              </Text>
              
              <Icon name="clock-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {item.dueTime}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteTask(item.id)}
        >
          <Icon name="delete-outline" size={22} color={colors.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          در حال بارگذاری...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => setShowMenu(true)}
            >
              <Icon name="menu" size={28} color={colors.primary} />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                📝 مدیریت کارها
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                {user ? user.name : 'کاربر مهمان'} • {stats.active} کار فعال
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.themeButton, { backgroundColor: colors.background }]}
              onPress={() => setDarkMode(!darkMode)}
            >
              <Icon 
                name={darkMode ? 'white-balance-sunny' : 'moon-waning-crescent'} 
                size={22} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.addForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>
              اضافه کردن کار جدید
            </Text>
            
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.taskInput,
                  { 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border
                  }
                ]}
                placeholder="عنوان کار را وارد کنید..."
                placeholderTextColor={colors.textSecondary}
                value={newTask}
                onChangeText={setNewTask}
                returnKeyType="done"
              />
              <TouchableOpacity 
                style={[
                  styles.addButton,
                  { backgroundColor: colors.primary },
                  !newTask && styles.addButtonDisabled
                ]}
                onPress={addTask}
                disabled={!newTask}
              >
                <Icon name="plus" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.descriptionInput,
                { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border
                }
              ]}
              placeholder="توضیحات (اختیاری)..."
              placeholderTextColor={colors.textSecondary}
              value={taskDescription}
              onChangeText={setTaskDescription}
              multiline
            />

            <Text style={[styles.label, { color: colors.text }]}>دسته‌بندی:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {['کار', 'شخصی', 'خرید', 'سلامتی', 'آموزش', 'پروژه'].map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    { borderColor: colors.border },
                    taskCategory === cat && { backgroundColor: getCategoryColor(cat), borderColor: getCategoryColor(cat) }
                  ]}
                  onPress={() => setTaskCategory(cat)}
                >
                  <Icon 
                    name={getCategoryIcon(cat)} 
                    size={18} 
                    color={taskCategory === cat ? 'white' : getCategoryColor(cat)} 
                  />
                  <Text style={[
                    styles.categoryOptionText,
                    { color: taskCategory === cat ? 'white' : colors.text },
                    taskCategory === cat && styles.categoryOptionTextActive
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: colors.text }]}>اولویت:</Text>
            <View style={styles.priorityContainer}>
              {['پایین', 'متوسط', 'بالا'].map(pri => (
                <TouchableOpacity
                  key={pri}
                  style={[
                    styles.priorityOption,
                    { borderColor: colors.border },
                    priority === pri && [
                      styles.priorityOptionActive,
                      { 
                        backgroundColor: 
                          pri === 'بالا' ? colors.danger + '20' :
                          pri === 'متوسط' ? colors.warning + '20' :
                          colors.success + '20',
                        borderColor: 
                          pri === 'بالا' ? colors.danger :
                          pri === 'متوسط' ? colors.warning :
                          colors.success
                      }
                    ]
                  ]}
                  onPress={() => setPriority(pri)}
                >
                  <View style={[
                    styles.priorityDot,
                    { 
                      backgroundColor: 
                        pri === 'بالا' ? colors.danger :
                        pri === 'متوسط' ? colors.warning :
                        colors.success
                    }
                  ]} />
                  <Text style={[
                    styles.priorityOptionText,
                    { color: colors.textSecondary },
                    priority === pri && { 
                      color: 
                        pri === 'بالا' ? colors.danger :
                        pri === 'متوسط' ? colors.warning :
                        colors.success,
                      fontWeight: 'bold'
                    }
                  ]}>
                    {pri}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.datetimeContainer}>
              <View style={styles.datetimeColumn}>
                <Text style={[styles.label, { color: colors.text }]}>تاریخ:</Text>
                <TouchableOpacity 
                  style={[styles.dateButton, { 
                    backgroundColor: colors.background, 
                    borderColor: colors.border,
                  }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Icon name="calendar" size={20} color={colors.primary} />
                  <Text style={{ 
                    fontSize: 16, 
                    color: dueDate ? colors.text : colors.textSecondary,
                    marginRight: 10 
                  }}>
                    {dueDate ? formatDate(dueDate) : 'انتخاب تاریخ'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.datetimeColumn}>
                <Text style={[styles.label, { color: colors.text }]}>ساعت:</Text>
                <TouchableOpacity 
                  style={[styles.dateButton, { 
                    backgroundColor: colors.background, 
                    borderColor: colors.border,
                  }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Icon name="clock-outline" size={20} color={colors.primary} />
                  <Text style={{ 
                    fontSize: 16, 
                    color: dueTime ? colors.text : colors.textSecondary,
                    marginRight: 10 
                  }}>
                    {dueTime || 'انتخاب زمان'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <CustomDatePicker
            visible={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            onDateSelect={handleDateSelect}
          />

          <CustomTimePicker
            visible={showTimePicker}
            onClose={() => setShowTimePicker(false)}
            onTimeSelect={handleTimeSelect}
          />

          <SlideMenu
            visible={showMenu}
            onClose={() => setShowMenu(false)}
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onSignup={handleSignup}
            darkMode={darkMode}
          />

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {['همه', 'فعال', 'تکمیل‌شده', 'امروز'].map(f => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  filter === f && [styles.filterButtonActive, { backgroundColor: colors.primary, borderColor: colors.primary }]
                ]}
                onPress={() => setFilter(f)}
              >
                <Text style={[
                  styles.filterText,
                  { color: colors.textSecondary },
                  filter === f && styles.filterTextActive
                ]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="clipboard-text-outline" size={80} color={colors.textSecondary} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                {filter === 'همه' ? 'هنوز کاری اضافه نکردید!' :
                 filter === 'تکمیل‌شده' ? 'کاری تکمیل نشده!' :
                 filter === 'امروز' ? 'کاری برای امروز ندارید!' :
                 'هیچ کاری فعال نیست!'}
              </Text>
              <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
                یک کار جدید اضافه کنید
              </Text>
              {!user && (
                <TouchableOpacity 
                  style={[styles.guestWarning, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}
                  onPress={() => setShowMenu(true)}
                >
                  <Icon name="alert-circle" size={20} color={colors.warning} />
                  <Text style={[styles.guestWarningText, { color: colors.warning }]}>
                    برای ذخیره دائمی کارها، لطفاً وارد حساب کاربری شوید
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.taskList}>
              <View style={styles.listHeaderRow}>
                <Text style={[styles.listHeader, { color: colors.textSecondary }]}>
                  {filteredTasks.length} کار پیدا شد
                </Text>
                {!user && (
                  <TouchableOpacity 
                    style={styles.saveWarning}
                    onPress={() => setShowMenu(true)}
                  >
                    <Icon name="cloud-off" size={16} color={colors.warning} />
                    <Text style={[styles.saveWarningText, { color: colors.warning }]}>
                      ذخیره موقت
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <FlatList
                data={filteredTasks}
                renderItem={({ item }) => <TaskItem item={item} />}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  menuButton: {
    padding: 5,
  },
  headerContent: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  themeButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  // Menu Styles
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.8,
    maxWidth: 300,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 5,
  },
  userStats: {
    fontSize: 12,
    marginTop: 5,
  },
  menuItems: {
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  menuItemText: {
    fontSize: 16,
    marginRight: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 'auto',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  // Auth in Menu Styles
  authMenu: {
    flex: 1,
  },
  menuHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  inputIcon: {
    marginHorizontal: 15,
  },
  menuInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    paddingHorizontal: 10,
    textAlign: 'right',
  },
  menuAuthButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  menuAuthButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchAuthButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchAuthText: {
    fontSize: 14,
  },
  authInfo: {
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
  },
  authInfoText: {
    fontSize: 12,
    marginVertical: 2,
  },
  // Main App Styles
  addForm: {
    margin: 15,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  taskInput: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    textAlign: 'right',
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  descriptionInput: {
    height: 80,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    textAlign: 'right',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    marginTop: 5,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1.5,
  },
  categoryOptionText: {
    fontSize: 14,
    marginRight: 8,
  },
  categoryOptionTextActive: {
    fontWeight: 'bold',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    marginHorizontal: 5,
  },
  priorityOptionActive: {
    borderWidth: 2,
  },
  priorityOptionText: {
    fontSize: 14,
    marginRight: 8,
  },
  datetimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  datetimeColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 15,
  },
  // Picker Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: 400,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dateDisplay: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  pickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  pickerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#4F46E5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timePickerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 200,
    marginBottom: 20,
  },
  timeScroll: {
    flex: 1,
    marginHorizontal: 5,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginVertical: 2,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  selectedTimeOption: {
    backgroundColor: '#4F46E5',
  },
  timeOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedTimeOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  ampmContainer: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ampmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
    width: '80%',
    alignItems: 'center',
  },
  selectedAmpm: {
    backgroundColor: '#4F46E5',
  },
  ampmText: {
    fontSize: 14,
    color: '#333',
  },
  selectedAmpmText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterScroll: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  filterButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1.5,
  },
  filterButtonActive: {
    borderWidth: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  guestWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 20,
    width: '100%',
  },
  guestWarningText: {
    fontSize: 14,
    marginRight: 10,
    flex: 1,
    textAlign: 'right',
  },
  taskList: {
    paddingHorizontal: 15,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  listHeader: {
    fontSize: 14,
  },
  saveWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: '#FDE68A20',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  saveWarningText: {
    fontSize: 12,
    marginRight: 5,
    color: '#F59E0B',
  },
  taskItem: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  checkbox: {
    marginLeft: 10,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 10,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 5,
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
    textAlign: 'right',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 15,
  },
  metaText: {
    fontSize: 12,
    marginRight: 5,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  deleteButton: {
    padding: 5,
    marginLeft: 5,
  },
});