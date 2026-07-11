import { Brain, Drama, DoorClosed, Shield, BookOpen, Film, Newspaper } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavigationItem {
	key: string // 用于翻译键，如 'methods' -> t('nav.methods')
	path: string // URL 路径，如 '/methods'
	icon: LucideIcon // Lucide 图标组件
	isContentType: boolean // 是否对应 content/ 目录
}

// 导航分类顺序按玩家需求优先级（Abstraction 方法 > Caine > Cellar > Survival > 新手指南 > 过场动画 > 更新）
export const NAVIGATION_CONFIG: NavigationItem[] = [
	{ key: 'methods', path: '/methods', icon: Brain, isContentType: true },
	{ key: 'caine', path: '/caine', icon: Drama, isContentType: true },
	{ key: 'cellar', path: '/cellar', icon: DoorClosed, isContentType: true },
	{ key: 'survival', path: '/survival', icon: Shield, isContentType: true },
	{ key: 'guide', path: '/guide', icon: BookOpen, isContentType: true },
	{ key: 'cutscenes', path: '/cutscenes', icon: Film, isContentType: true },
	{ key: 'updates', path: '/updates', icon: Newspaper, isContentType: true },
]

// 从配置派生内容类型列表（用于路由和内容加载）
export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => item.isContentType).map(
	(item) => item.path.slice(1),
) // 移除开头的 '/' -> ['methods', 'caine', 'cellar', 'survival', 'guide', 'cutscenes', 'updates']

export type ContentType = (typeof CONTENT_TYPES)[number]

// 辅助函数：验证内容类型
export function isValidContentType(type: string): type is ContentType {
	return CONTENT_TYPES.includes(type as ContentType)
}
