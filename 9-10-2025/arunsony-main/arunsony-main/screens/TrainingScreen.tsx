import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';

interface TrainingScreenProps {
  navigation: any;
}

export default function TrainingScreen({ navigation }: TrainingScreenProps) {
  const [activeTab, setActiveTab] = useState('Courses');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const tabs = ['Courses', 'Videos', 'Strategies', 'Success Stories'];

  const categories = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Leadership'];

  const courses = [
    {
      id: '1',
      title: 'Wealth Building Fundamentals',
      description: 'Learn the basics of multi-level marketing',
      duration: '2 hours',
      lessons: 8,
      level: 'Beginner',
      progress: 75,
      thumbnail: '📚',
      instructor: 'John Smith'
    },
    {
      id: '2',
      title: 'Building Your Network',
      description: 'Strategies for expanding your referral network',
      duration: '3 hours',
      lessons: 12,
      level: 'Intermediate',
      progress: 45,
      thumbnail: '🌐',
      instructor: 'Sarah Johnson'
    },
    {
      id: '3',
      title: 'Advanced Sales Techniques',
      description: 'Master the art of persuasion and closing',
      duration: '4 hours',
      lessons: 15,
      level: 'Advanced',
      progress: 0,
      thumbnail: '💼',
      instructor: 'Mike Davis'
    },
    {
      id: '4',
      title: 'Team Leadership',
      description: 'Lead and motivate your downline effectively',
      duration: '5 hours',
      lessons: 20,
      level: 'Leadership',
      progress: 0,
      thumbnail: '👥',
      instructor: 'Lisa Chen'
    }
  ];

  const videos = [
    {
      id: '1',
      title: 'How to Share Your Referral Link',
      duration: '15 min',
      views: '2.5K',
      thumbnail: '📱',
      category: 'Beginner'
    },
    {
      id: '2',
      title: 'Understanding Commission Structure',
      duration: '20 min',
      views: '1.8K',
      thumbnail: '💰',
      category: 'Beginner'
    },
    {
      id: '3',
      title: 'Social Media Marketing Tips',
      duration: '25 min',
      views: '3.2K',
      thumbnail: '📱',
      category: 'Intermediate'
    },
    {
      id: '4',
      title: 'Handling Objections Like a Pro',
      duration: '30 min',
      views: '1.5K',
      thumbnail: '🎯',
      category: 'Advanced'
    }
  ];

  const strategies = [
    {
      id: '1',
      title: 'Daily Action Plan',
      description: 'A step-by-step guide to daily activities that drive results',
      timeRequired: '30 min/day',
      difficulty: 'Beginner',
      icon: '📅'
    },
    {
      id: '2',
      title: 'Social Media Mastery',
      description: 'Leverage social platforms to grow your network',
      timeRequired: '1 hour/day',
      difficulty: 'Intermediate',
      icon: '📱'
    },
    {
      id: '3',
      title: 'Follow-up System',
      description: 'Never lose a potential referral with this system',
      timeRequired: '45 min/day',
      difficulty: 'Intermediate',
      icon: '📞'
    },
    {
      id: '4',
      title: 'Team Building Framework',
      description: 'Systematic approach to building a strong team',
      timeRequired: '2 hours/day',
      difficulty: 'Advanced',
      icon: '🏗️'
    }
  ];

  const successStories = [
    {
      id: '1',
      name: 'Amit Kumar',
      level: 'Gold',
      earnings: '₹50,000/month',
      story: 'Started with zero network, now earning consistently through dedicated effort and proper training.',
      avatar: 'AK',
      joinDate: '6 months ago'
    },
    {
      id: '2',
      name: 'Priya Sharma',
      level: 'Silver',
      earnings: '₹25,000/month',
      story: 'Used social media effectively to build a network of 50+ active members.',
      avatar: 'PS',
      joinDate: '4 months ago'
    },
    {
      id: '3',
      name: 'Rahul Gupta',
      level: 'Diamond',
      earnings: '₹1,00,000/month',
      story: 'Applied advanced strategies and built a team of 200+ members across multiple levels.',
      avatar: 'RG',
      joinDate: '1 year ago'
    }
  ];

  const filteredCourses = courses.filter(course => {
    if (selectedCategory === 'All') return true;
    return course.level === selectedCategory;
  });

  const renderCoursesContent = () => (
    <View style={styles.coursesContent}>
      {/* Category Filter */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.filterChip, selectedCategory === category && styles.activeFilterChip]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[styles.filterText, selectedCategory === category && styles.activeFilterText]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Courses List */}
      <View style={styles.coursesList}>
        {filteredCourses.map((course) => (
          <TouchableOpacity
            key={course.id}
            style={styles.courseCard}
            onPress={() => Alert.alert('Course', `Opening ${course.title}...`)}
          >
            <View style={styles.courseHeader}>
              <Text style={styles.courseThumbnail}>{course.thumbnail}</Text>
              <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseDescription}>{course.description}</Text>
                <View style={styles.courseMeta}>
                  <Text style={styles.courseDuration}>{course.duration}</Text>
                  <Text style={styles.courseLessons}>{course.lessons} lessons</Text>
                  <Text style={styles.courseInstructor}>by {course.instructor}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.courseFooter}>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${course.progress}%` }]} 
                  />
                </View>
                <Text style={styles.progressText}>{course.progress}% complete</Text>
              </View>
              
              <View style={[styles.levelBadge, { backgroundColor: getLevelColor(course.level) }]}>
                <Text style={styles.levelText}>{course.level}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderVideosContent = () => (
    <View style={styles.videosContent}>
      <View style={styles.videosList}>
        {videos.map((video) => (
          <TouchableOpacity
            key={video.id}
            style={styles.videoCard}
            onPress={() => Alert.alert('Video', `Playing ${video.title}...`)}
          >
            <View style={styles.videoThumbnail}>
              <Text style={styles.videoThumbnailText}>{video.thumbnail}</Text>
              <View style={styles.playButton}>
                <AntDesign name="play" size={20} color="#FFFFFF" />
              </View>
            </View>
            
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <View style={styles.videoMeta}>
                <Text style={styles.videoDuration}>{video.duration}</Text>
                <Text style={styles.videoViews}>{video.views} views</Text>
              </View>
              <View style={[styles.categoryBadge, { backgroundColor: getLevelColor(video.category) }]}>
                <Text style={styles.categoryText}>{video.category}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStrategiesContent = () => (
    <View style={styles.strategiesContent}>
      <View style={styles.strategiesList}>
        {strategies.map((strategy) => (
          <TouchableOpacity
            key={strategy.id}
            style={styles.strategyCard}
            onPress={() => Alert.alert('Strategy', `Opening ${strategy.title}...`)}
          >
            <View style={styles.strategyIcon}>
              <Text style={styles.strategyIconText}>{strategy.icon}</Text>
            </View>
            
            <View style={styles.strategyInfo}>
              <Text style={styles.strategyTitle}>{strategy.title}</Text>
              <Text style={styles.strategyDescription}>{strategy.description}</Text>
              <View style={styles.strategyMeta}>
                <Text style={styles.strategyTime}>{strategy.timeRequired}</Text>
                <View style={[styles.difficultyBadge, { backgroundColor: getLevelColor(strategy.difficulty) }]}>
                  <Text style={styles.difficultyText}>{strategy.difficulty}</Text>
                </View>
              </View>
            </View>
            
            <AntDesign name="right" size={16} color="#666666" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSuccessStoriesContent = () => (
    <View style={styles.storiesContent}>
      <View style={styles.storiesList}>
        {successStories.map((story) => (
          <View key={story.id} style={styles.storyCard}>
            <View style={styles.storyHeader}>
              <View style={styles.storyAvatar}>
                <Text style={styles.avatarText}>{story.avatar}</Text>
              </View>
              <View style={styles.storyInfo}>
                <Text style={styles.storyName}>{story.name}</Text>
                <Text style={styles.storyLevel}>{story.level} Member</Text>
                <Text style={styles.storyJoinDate}>Joined {story.joinDate}</Text>
              </View>
              <View style={styles.storyEarnings}>
                <Text style={styles.earningsAmount}>{story.earnings}</Text>
              </View>
            </View>
            
            <Text style={styles.storyText}>{story.story}</Text>
            
            <TouchableOpacity 
              style={styles.readMoreButton}
              onPress={() => Alert.alert('Success Story', `Reading full story of ${story.name}...`)}
            >
              <Text style={styles.readMoreText}>Read Full Story</Text>
              <AntDesign name="right" size={12} color="#FFD700" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      case 'Leadership': return '#9C27B0';
      default: return '#666666';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Training Center</Text>
          <TouchableOpacity 
            style={styles.certificateButton}
            onPress={() => Alert.alert('Certificates', 'Viewing your certificates...')}
          >
            <AntDesign name="trophy" size={20} color="#FFD700" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'Courses' && renderCoursesContent()}
          {activeTab === 'Videos' && renderVideosContent()}
          {activeTab === 'Strategies' && renderStrategiesContent()}
          {activeTab === 'Success Stories' && renderSuccessStoriesContent()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mainContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  certificateButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FFD700',
  },
  tabText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  // Courses Styles
  coursesContent: {
    paddingHorizontal: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  activeFilterChip: {
    backgroundColor: '#FFD700',
  },
  filterText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  coursesList: {
    marginBottom: 20,
  },
  courseCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  courseHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  courseThumbnail: {
    fontSize: 40,
    marginRight: 15,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  courseDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseDuration: {
    fontSize: 12,
    color: '#FFD700',
    marginRight: 10,
  },
  courseLessons: {
    fontSize: 12,
    color: '#666666',
    marginRight: 10,
  },
  courseInstructor: {
    fontSize: 12,
    color: '#666666',
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    marginRight: 15,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  levelText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Videos Styles
  videosContent: {
    paddingHorizontal: 20,
  },
  videosList: {
    marginBottom: 20,
  },
  videoCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  videoThumbnail: {
    width: 80,
    height: 60,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    position: 'relative',
  },
  videoThumbnailText: {
    fontSize: 24,
  },
  playButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  videoMeta: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  videoDuration: {
    fontSize: 12,
    color: '#FFD700',
    marginRight: 10,
  },
  videoViews: {
    fontSize: 12,
    color: '#666666',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Strategies Styles
  strategiesContent: {
    paddingHorizontal: 20,
  },
  strategiesList: {
    marginBottom: 20,
  },
  strategyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  strategyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  strategyIconText: {
    fontSize: 24,
  },
  strategyInfo: {
    flex: 1,
  },
  strategyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  strategyDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  strategyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strategyTime: {
    fontSize: 12,
    color: '#FFD700',
    marginRight: 10,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Stories Styles
  storiesContent: {
    paddingHorizontal: 20,
  },
  storiesList: {
    marginBottom: 20,
  },
  storyCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  storyAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  storyInfo: {
    flex: 1,
  },
  storyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  storyLevel: {
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 2,
  },
  storyJoinDate: {
    fontSize: 12,
    color: '#666666',
  },
  storyEarnings: {
    alignItems: 'flex-end',
  },
  earningsAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  storyText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 15,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 14,
    color: '#FFD700',
    marginRight: 5,
  },
});

